-- Dropar versões anteriores para evitar ambiguidade e erros de tipo
DROP FUNCTION IF EXISTS public.criar_agendamento_validado(bigint, text, timestamp with time zone, text);
DROP FUNCTION IF EXISTS public.criar_agendamento_validado(text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.criar_agendamento_validado(text, text, text, text, text); -- Garantir que dropamos se já existir essa

-- Criar nova versão BLINDADA contra caracteres inválidos do n8n
CREATE OR REPLACE FUNCTION public.criar_agendamento_validado(
    p_cliente_id TEXT,
    p_servico_id TEXT,
    p_data TEXT,
    p_observacoes TEXT DEFAULT '',
    p_funcionario_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa como owner para ter permissões
AS $$
DECLARE
    v_cliente_id BIGINT;
    v_servico_id TEXT;
    v_data TIMESTAMP WITH TIME ZONE;
    v_funcionario_id UUID;
    v_agendamento_id BIGINT;
    v_conflitos JSONB;
    v_disponivel BOOLEAN;
    v_funcionario_valido BOOLEAN;
BEGIN
    -- 1. Limpeza e Conversão dos Inputs (Blindagem contra n8n)
    BEGIN
        v_cliente_id := CAST(TRIM(REPLACE(p_cliente_id, '=', '')) AS BIGINT);
        v_servico_id := TRIM(REPLACE(p_servico_id, '=', ''));
        v_data := CAST(TRIM(REPLACE(p_data, '=', '')) AS TIMESTAMP WITH TIME ZONE);
        
        -- Tratamento especial para funcionario_id (pode ser nulo ou vir sujo)
        IF p_funcionario_id IS NOT NULL AND TRIM(REPLACE(p_funcionario_id, '=', '')) <> '' THEN
            v_funcionario_id := CAST(TRIM(REPLACE(p_funcionario_id, '=', '')) AS UUID);
        ELSE
            v_funcionario_id := NULL;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'sucesso', false,
            'erro', 'Erro ao processar parâmetros de entrada: ' || SQLERRM
        );
    END;

    -- 2. Log da chamada (para debug)
    INSERT INTO public.rpc_logs (function_name, params)
    VALUES (
        'criar_agendamento_validado', 
        jsonb_build_object(
            'p_cliente_id', p_cliente_id,
            'p_servico_id', p_servico_id,
            'p_data', p_data,
            'p_funcionario_id', p_funcionario_id,
            'cleaned_funcionario_id', v_funcionario_id
        )
    );

    -- 3. Validar Serviço
    IF NOT EXISTS (SELECT 1 FROM public.servicos WHERE id = v_servico_id AND ativo = true) THEN
        RETURN jsonb_build_object(
            'sucesso', false,
            'erro', 'Serviço não encontrado ou inativo'
        );
    END IF;

    -- 4. Validar Funcionário (se fornecido)
    IF v_funcionario_id IS NOT NULL THEN
        -- Verifica se funcionário existe e está ativo
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_funcionario_id AND role <> 'cliente' AND ativo = true) THEN
             RETURN jsonb_build_object(
                'sucesso', false,
                'erro', 'Funcionário inválido ou inativo'
            );
        END IF;

        -- Verifica se funcionário realiza o serviço
        v_funcionario_valido := public.funcionario_pode_executar_servico(v_funcionario_id, v_servico_id);
        IF NOT v_funcionario_valido THEN
            RETURN jsonb_build_object(
                'sucesso', false,
                'erro', 'O funcionário selecionado não realiza este serviço'
            );
        END IF;

        -- Verificar disponibilidade ESPECÍFICA do funcionário
        SELECT disponivel INTO v_disponivel
        FROM public.verificar_disponibilidade_por_funcionario(
            v_data, 
            v_data + (SELECT duracao FROM public.servicos WHERE id = v_servico_id) * INTERVAL '1 minute'
        ) func_disp
        WHERE func_disp.id = v_funcionario_id;

        IF v_disponivel IS FALSE THEN
             RETURN jsonb_build_object(
                'sucesso', false,
                'erro', 'Funcionário indisponível neste horário'
            );
        END IF;
    ELSE
        -- Se não informou funcionário, tenta verificar disponibilidade geral (legado ou auto-assign)
        -- Por enquanto, para manter compatibilidade, se não passar funcionário, vamos exigir que passe.
        -- Ou podemos implementar lógica de "qualquer um disponível".
        -- Vamos assumir que o n8n DEVE passar o funcionário se for agendamento com profissional específico.
        
        -- Se for NULL, vamos tentar achar um disponível (Opcional, mas o prompt do n8n instrui a escolher)
        -- Vamos deixar passar NULL apenas se a lógica de negócio permitir "qualquer um", 
        -- mas aqui vamos retornar erro pedindo funcionário se o sistema exigir.
        -- Como o n8n está sendo treinado para escolher, vamos aceitar NULL e deixar o trigger/view lidar 
        -- OU atribuir o primeiro disponível.
        
        -- Vamos tentar atribuir automaticamente um disponível se vier NULL
        SELECT id INTO v_funcionario_id
        FROM public.verificar_disponibilidade_por_funcionario(
            v_data, 
            v_data + (SELECT duracao FROM public.servicos WHERE id = v_servico_id) * INTERVAL '1 minute'
        )
        WHERE disponivel = true
        LIMIT 1;
        
        IF v_funcionario_id IS NULL THEN
             RETURN jsonb_build_object(
                'sucesso', false,
                'erro', 'Nenhum funcionário disponível para este horário'
            );
        END IF;
    END IF;


    -- 5. Verificar Conflitos Gerais (Dupla checagem)
    -- A verificação por funcionário já deve ter coberto, mas vamos garantir que não insere em cima de outro
    IF EXISTS (
        SELECT 1 FROM public.agendamentos a
        WHERE a.funcionario_id = v_funcionario_id
          AND a.status = 'agendado'
          AND (
            (a.data_hora_inicio, a.data_hora_fim) OVERLAPS 
            (v_data, v_data + (SELECT duracao FROM public.servicos WHERE id = v_servico_id) * INTERVAL '1 minute')
          )
    ) THEN
        RETURN jsonb_build_object(
            'sucesso', false,
            'erro', 'Conflito de horário detectado na verificação final'
        );
    END IF;


    -- 6. Criar Agendamento
    INSERT INTO public.agendamentos (
        cliente_id,
        servico_id,
        funcionario_id,
        data_hora_inicio,
        data_hora_fim,
        observacoes,
        status
    )
    VALUES (
        v_cliente_id,
        v_servico_id,
        v_funcionario_id,
        v_data,
        v_data + (SELECT duracao FROM public.servicos WHERE id = v_servico_id) * INTERVAL '1 minute',
        p_observacoes,
        'agendado'
    )
    RETURNING id INTO v_agendamento_id;

    -- 7. Retorno Sucesso
    RETURN jsonb_build_object(
        'sucesso', true,
        'agendamento_id', v_agendamento_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'sucesso', false,
        'erro', SQLERRM
    );
END;
$$;
