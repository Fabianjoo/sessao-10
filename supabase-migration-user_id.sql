-- =============================================================
-- Migration: Adicionar user_id para isolamento por usuário
-- Execute no SQL Editor do Supabase
-- =============================================================

-- 1. Adicionar coluna user_id nas tabelas existentes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE sessoes  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Preencher user_id com o primeiro usuário encontrado (para dados existentes)
--    Se houver dados órfãos, eles ficarão visíveis apenas quando o usuário correto logar.
--    Ajuste o email abaixo para o seu usuário.
DO $$
DECLARE
  primeiro_uid UUID;
BEGIN
  SELECT id INTO primeiro_uid FROM auth.users ORDER BY created_at ASC LIMIT 1;

  IF primeiro_uid IS NOT NULL THEN
    UPDATE clientes SET user_id = primeiro_uid WHERE user_id IS NULL;
    UPDATE sessoes  SET user_id = primeiro_uid WHERE user_id IS NULL;
  END IF;
END $$;

-- 3. Tornar user_id NOT NULL (apenas se todas as linhas foram preenchidas)
ALTER TABLE clientes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE sessoes  ALTER COLUMN user_id SET NOT NULL;

-- 4. Remover políticas antigas
DROP POLICY IF EXISTS "Acesso total anônimo clientes" ON clientes;
DROP POLICY IF EXISTS "Acesso total autenticado clientes" ON clientes;
DROP POLICY IF EXISTS "Acesso total anônimo sessoes" ON sessoes;
DROP POLICY IF EXISTS "Acesso total autenticado sessoes" ON sessoes;

-- 5. Criar novas políticas por usuário
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios clientes" ON clientes;
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias sessões" ON sessoes;

CREATE POLICY "Usuários podem ver apenas seus próprios clientes" ON clientes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem ver apenas suas próprias sessões" ON sessoes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
