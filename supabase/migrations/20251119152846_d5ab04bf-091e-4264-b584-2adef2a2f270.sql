-- FASE 1: Corrigir Duplicidade de Atividades

-- 1.1. Limpar duplicatas existentes (mantém apenas o registro mais antigo)
DELETE FROM atividades_dashboard a
USING atividades_dashboard b
WHERE a.id > b.id
  AND a.agendamento_id = b.agendamento_id
  AND a.tipo = b.tipo
  AND a.created_at BETWEEN b.created_at - INTERVAL '2 seconds' AND b.created_at + INTERVAL '2 seconds';

-- 1.2. Atualizar função log_agendamento_operation com prevenção de duplicatas
CREATE OR REPLACE FUNCTION public.log_agendamento_operation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.operacoes_agendamento (agendamento_id, acao, detalhes)
    VALUES (NEW.id, 'criado', row_to_json(NEW));
    
    -- Inserir apenas se não existe registro similar recente
    INSERT INTO public.atividades_dashboard (tipo, descricao, cliente_id, agendamento_id)
    SELECT 'novo', 
           'Novo agendamento: ' || c.nome || ' - ' || s.nome,
           NEW.cliente_id,
           NEW.id
    FROM public.clientes c
    JOIN public.servicos s ON s.id = NEW.servico_id
    WHERE c.id = NEW.cliente_id
      AND NOT EXISTS (
        SELECT 1 FROM public.atividades_dashboard ad
        WHERE ad.agendamento_id = NEW.id
          AND ad.tipo = 'novo'
          AND ad.created_at > NOW() - INTERVAL '2 seconds'
      );
    
    RETURN NEW;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status != NEW.status) THEN
      INSERT INTO public.operacoes_agendamento (agendamento_id, acao, detalhes)
      VALUES (NEW.id, 'status_alterado', jsonb_build_object(
        'status_anterior', OLD.status,
        'status_novo', NEW.status
      ));
      
      -- Inserir apenas se não existe registro similar recente
      INSERT INTO public.atividades_dashboard (tipo, descricao, cliente_id, agendamento_id)
      SELECT 
        CASE 
          WHEN NEW.status = 'confirmado' THEN 'confirmacao'
          WHEN NEW.status = 'cancelado' THEN 'cancelamento'
          WHEN NEW.status = 'remarcado' THEN 'remarcacao'
          ELSE 'novo'
        END as tipo_atividade,
        'Agendamento ' || NEW.status || ': ' || c.nome,
        NEW.cliente_id,
        NEW.id
      FROM public.clientes c
      WHERE c.id = NEW.cliente_id
        AND NOT EXISTS (
          SELECT 1 FROM public.atividades_dashboard ad
          WHERE ad.agendamento_id = NEW.id
            AND ad.tipo = CASE 
              WHEN NEW.status = 'confirmado' THEN 'confirmacao'
              WHEN NEW.status = 'cancelado' THEN 'cancelamento'
              WHEN NEW.status = 'remarcado' THEN 'remarcacao'
              ELSE 'novo'
            END
            AND ad.created_at > NOW() - INTERVAL '2 seconds'
        );
    END IF;
    
    IF (OLD.data != NEW.data) THEN
      INSERT INTO public.operacoes_agendamento (agendamento_id, acao, detalhes)
      VALUES (NEW.id, 'remarcado', jsonb_build_object(
        'data_anterior', OLD.data,
        'data_nova', NEW.data
      ))
      ON CONFLICT DO NOTHING;
      
      -- Inserir apenas se não existe registro similar recente
      INSERT INTO public.atividades_dashboard (tipo, descricao, cliente_id, agendamento_id)
      SELECT 'remarcacao',
             'Agendamento remarcado: ' || c.nome || ' - ' || s.nome,
             NEW.cliente_id,
             NEW.id
      FROM public.clientes c
      JOIN public.servicos s ON s.id = NEW.servico_id
      WHERE c.id = NEW.cliente_id
        AND NOT EXISTS (
          SELECT 1 FROM public.atividades_dashboard ad
          WHERE ad.agendamento_id = NEW.id
            AND ad.tipo = 'remarcacao'
            AND ad.created_at > NOW() - INTERVAL '2 seconds'
        );
    END IF;
    
    RETURN NEW;
    
  ELSIF (TG_OP = 'DELETE') THEN
    BEGIN
      INSERT INTO public.operacoes_agendamento (agendamento_id, acao, detalhes)
      VALUES (OLD.id, 'deletado', row_to_json(OLD));
    EXCEPTION
      WHEN OTHERS THEN
        NULL;
    END;
    
    RETURN OLD;
  END IF;
END;
$function$;