-- =============================================================
-- Schema para o Sessão 10 (Supabase)
-- Execute este SQL no SQL Editor do seu projeto Supabase
-- =============================================================

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  telefone TEXT DEFAULT '',
  cpf TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  cep TEXT DEFAULT '',
  numero TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  observacoes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de sessões
CREATE TABLE IF NOT EXISTS sessoes (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  clienteId BIGINT NOT NULL,
  nomeCliente TEXT DEFAULT '',
  tipo TEXT DEFAULT 'avulsa',
  servico TEXT DEFAULT '',
  status TEXT DEFAULT 'agendada',
  data TEXT DEFAULT '',
  hora TEXT DEFAULT '',
  valor TEXT DEFAULT '',
  obs TEXT DEFAULT '',
  pacoteId BIGINT,
  totalSessoes INTEGER,
  sessoesRealizadas INTEGER DEFAULT 0,
  dataCadastro TEXT DEFAULT '',
  finalizada BOOLEAN DEFAULT FALSE,
  duracao TEXT DEFAULT '',
  observacaoCancelamento TEXT DEFAULT '',
  dataCancelamento TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  pacote_id BIGINT NOT NULL,
  cliente_id BIGINT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  data TEXT NOT NULL,
  obs TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_pacote_id ON pagamentos(pacote_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessoes_clienteId ON sessoes(clienteId);
CREATE INDEX IF NOT EXISTS idx_sessoes_data ON sessoes(data);
CREATE INDEX IF NOT EXISTS idx_sessoes_status ON sessoes(status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at automático
DROP TRIGGER IF EXISTS set_clientes_updated_at ON clientes;
CREATE TRIGGER set_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_sessoes_updated_at ON sessoes;
CREATE TRIGGER set_sessoes_updated_at
  BEFORE UPDATE ON sessoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_pagamentos_updated_at ON pagamentos;
CREATE TRIGGER set_pagamentos_updated_at
  BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- RLS (Row Level Security)
-- Apenas usuários autenticados podem acessar os dados.
-- =============================================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes (apenas próprios registros)
DROP POLICY IF EXISTS "Acesso total anônimo clientes" ON clientes;
DROP POLICY IF EXISTS "Acesso total autenticado clientes" ON clientes;
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios clientes" ON clientes;
CREATE POLICY "Usuários podem ver apenas seus próprios clientes" ON clientes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Políticas para sessoes (apenas próprios registros)
DROP POLICY IF EXISTS "Acesso total anônimo sessoes" ON sessoes;
DROP POLICY IF EXISTS "Acesso total autenticado sessoes" ON sessoes;
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias sessões" ON sessoes;
CREATE POLICY "Usuários podem ver apenas suas próprias sessões" ON sessoes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Políticas para pagamentos (apenas próprios registros)
DROP POLICY IF EXISTS "Acesso total anônimo pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Acesso total autenticado pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios pagamentos" ON pagamentos;
CREATE POLICY "Usuários podem ver apenas seus próprios pagamentos" ON pagamentos
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================
-- (Opcional) Migrar dados existentes do localStorage
-- Se você já tem dados no sistema, exporte manualmente pelo
-- console do navegador e insira aqui.
-- =============================================================
