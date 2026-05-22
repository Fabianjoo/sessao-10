-- =============================================================
-- Schema para o Gerenciador de Sessões (Supabase)
-- Execute este SQL no SQL Editor do seu projeto Supabase
-- =============================================================

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id BIGINT PRIMARY KEY,
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

-- =============================================================
-- RLS (Row Level Security)
-- Como é uma aplicação single-tenant, permitimos acesso anônimo.
-- Futuramente você pode adicionar autenticação e restringir.
-- =============================================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
DROP POLICY IF EXISTS "Acesso total anônimo clientes" ON clientes;
CREATE POLICY "Acesso total anônimo clientes" ON clientes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Políticas para sessoes
DROP POLICY IF EXISTS "Acesso total anônimo sessoes" ON sessoes;
CREATE POLICY "Acesso total anônimo sessoes" ON sessoes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- (Opcional) Migrar dados existentes do localStorage
-- Se você já tem dados no sistema, exporte manualmente pelo
-- console do navegador e insira aqui.
-- =============================================================
