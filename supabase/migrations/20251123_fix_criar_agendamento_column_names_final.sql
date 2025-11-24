-- Dropar versões anteriores para evitar ambiguidade e erros de tipo
DROP FUNCTION IF EXISTS public.criar_agendamento_validado(bigint, text, timestamp with time zone, text);
DROP FUNCTION IF EXISTS public.criar_agendamento_validado(text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.criar_agendamento_validado(text, text, text, text, text);

-- Criar nova versão BLINDADA com NOMES DE COLUNAS CORRETOS
CREATE OR REPLACE FUNCTION public.criar_agendamento_validado(
    p_cliente_id TEXT,
    p_servico_id TEXT,
    p_data TEXT,
    p_observacoes TEXT DEFAULT '',
    p_funcionario_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
    v_data_fim TIMESTAMP WITH TIME ZONE;
    v_data_iso TEXT;
    v_data_fim_iso TEXT;
BEGIN
    -- 1. Limpeza e Conversão dos Inputs (Blindagem contra n8n)
    BEGIN
        v_cliente_id := CAST(TRIM(REPLACE(p_cliente_id, '=', '')) AS BIGINT);
        v_servico_id := TRIM(REPLACE(p_servico_id, '=', ''));
        v_data := CAST(TRIM(REPLACE(p_data, '=', '')) AS TIMESTAMP WITH TIME ZONE);
        
        -- Tratamento especial para funcionario_id
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
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_funcionario_id AND role <> 'cliente' AND ativo = true) THEN
             RETURN jsonb_build_object(
                'sucesso', false,
                'erro', 'Funcionário inválido ou inativo'
            );
        END IF;

        v_funcionario_valido := public.funcionario_pode_executar_servico(v_funcionario_id, v_servico_id);
        IF NOT v_funcionario_valido THEN
            RETURN jsonb_build_object(
                'sucesso', false,
                'erro', 'O funcionário selecionado não realiza este serviço'
            );
        END IF;

        -- Calcular data fim
        v_data_fim := v_data + (SELECT duracao_minutos FROM public.servicos WHERE id = v_servico_id) * INTERVAL '1 minute';
        v_data_iso := TO_CHAR(v_data, 'YYYY-MM-DD"T"HH24:MI:SSOF');
        v_data_fim_iso := TO_CHAR(v_data_fim, 'YYYY-MM-DD"T"HH24:MI:SSOF');

        -- CORREÇÃO AQUI: func_disp.id -> func_disp.funcionario_id
        SELECT disponivel INTO v_disponivel
        FROM public.verificar_disponibilidade_por_funcionario(
            v_data_iso, 
            v_data_fim_iso,
            v_servico_id
        ) func_disp
        WHERE func_disp.funcionario_id = v_funcionario_id;

        IF v_disponivel IS FALSE THEN
             RETURN jsonb_build_object(
                'sucesso', false,
                'erro', 'Funcionário indisponível neste horário'
            );
        END IF;
    ELSE
        -- Calcular data fim
        v_data_fim := v_data + (SELECT duracao_minutos FROM public.servicos WHERE id = v_servico_id) * INTERVAL '1 minute';
        v_data_iso := TO_CHAR(v_data, 'YYYY-MM-DD"T"HH24:MI:SSOF');
        v_data_fim_iso := TO_CHAR(v_data_fim, 'YYYY-MM-DD"T"HH24:MI:SSOF');
        
        -- CORREÇÃO AQUI: id -> funcionario_id
        SELECT funcionario_id INTO v_funcionario_id
        FROM public.verificar_disponibilidade_por_funcionario(
            v_data_iso, 
            v_data_fim_iso,
            v_servico_id
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

    -- 5. Verificar Conflitos Gerais
    IF EXISTS (
        SELECT 1 FROM public.agendamentos a
        WHERE a.funcionario_id = v_funcionario_id
          AND a.status = 'agendado'
          AND (
            (a.data_hora_inicio, a.data_hora_fim) OVERLAPS 
            (v_data, v_data + (SELECT duracao_minutos FROM public.servicos WHERE id = v_servico_id) * INTERVAL '1 minute')
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
        v_data + (SELECT duracao_minutos FROM public.servicos WHERE id = v_servico_id) * INTERVAL '1 minute',
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
