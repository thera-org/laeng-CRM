-- ============================================================
-- ALMOXARIFADO MODULE - Supabase Schema + RLS Policies
-- ============================================================

-- 1. TABELA: materiais
CREATE TABLE materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  unidade_medida TEXT NOT NULL CHECK (unidade_medida IN ('peca', 'metro', 'litro', 'kg')),
  estoque_inicial NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para prevenir nomes duplicados (case-insensitive)
CREATE UNIQUE INDEX idx_materiais_nome_lower ON materiais (LOWER(nome));

-- 2. TABELA: material_entradas
CREATE TABLE material_entradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materiais(id) ON DELETE RESTRICT,
  quantidade NUMERIC NOT NULL CHECK (quantidade > 0),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  cliente_id UUID REFERENCES clientes(id),
  observacao TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABELA: material_saidas
CREATE TABLE material_saidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materiais(id) ON DELETE RESTRICT,
  quantidade NUMERIC NOT NULL CHECK (quantidade > 0),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  cliente_id UUID REFERENCES clientes(id),
  observacao TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- MATERIAIS (admin-only)
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materiais_select" ON materiais
  FOR SELECT USING (
    (auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text)))
    OR (auth.uid() IN ( SELECT p.usuario_id FROM usuario_permissoes_funcionalidades p
      WHERE (COALESCE((((p.modulos -> 'material-entrada'::text) ->> 'view'::text))::boolean, false) = true)
        OR (COALESCE((((p.modulos -> 'material-saida'::text) ->> 'view'::text))::boolean, false) = true)))
  );

CREATE POLICY "materiais_insert" ON materiais
  FOR INSERT WITH CHECK (
    auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text))
  );

CREATE POLICY "materiais_update" ON materiais
  FOR UPDATE USING (
    auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text))
  );

CREATE POLICY "materiais_delete" ON materiais
  FOR DELETE USING (
    auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text))
  );

-- MATERIAL_ENTRADAS (admin + material-entrada permission)
ALTER TABLE material_entradas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "material_entradas_select" ON material_entradas
  FOR SELECT USING (
    (auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text)))
    OR (auth.uid() IN ( SELECT p.usuario_id FROM usuario_permissoes_funcionalidades p
      WHERE (COALESCE((((p.modulos -> 'material-entrada'::text) ->> 'view'::text))::boolean, false) = true)))
  );

CREATE POLICY "material_entradas_insert" ON material_entradas
  FOR INSERT WITH CHECK (
    (auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text)))
    OR (auth.uid() IN ( SELECT p.usuario_id FROM usuario_permissoes_funcionalidades p
      WHERE (COALESCE((((p.modulos -> 'material-entrada'::text) ->> 'create'::text))::boolean, false) = true)))
  );

CREATE POLICY "material_entradas_update" ON material_entradas
  FOR UPDATE USING (
    (auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text)))
    OR (auth.uid() IN ( SELECT p.usuario_id FROM usuario_permissoes_funcionalidades p
      WHERE (COALESCE((((p.modulos -> 'material-entrada'::text) ->> 'edit'::text))::boolean, false) = true)))
  );

CREATE POLICY "material_entradas_delete" ON material_entradas
  FOR DELETE USING (
    (auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text)))
    OR (auth.uid() IN ( SELECT p.usuario_id FROM usuario_permissoes_funcionalidades p
      WHERE (COALESCE((((p.modulos -> 'material-entrada'::text) ->> 'delete'::text))::boolean, false) = true)))
  );

-- MATERIAL_SAIDAS (admin + material-saida permission)
ALTER TABLE material_saidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "material_saidas_select" ON material_saidas
  FOR SELECT USING (
    (auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text)))
    OR (auth.uid() IN ( SELECT p.usuario_id FROM usuario_permissoes_funcionalidades p
      WHERE (COALESCE((((p.modulos -> 'material-saida'::text) ->> 'view'::text))::boolean, false) = true)))
  );

CREATE POLICY "material_saidas_insert" ON material_saidas
  FOR INSERT WITH CHECK (
    (auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text)))
    OR (auth.uid() IN ( SELECT p.usuario_id FROM usuario_permissoes_funcionalidades p
      WHERE (COALESCE((((p.modulos -> 'material-saida'::text) ->> 'create'::text))::boolean, false) = true)))
  );

CREATE POLICY "material_saidas_update" ON material_saidas
  FOR UPDATE USING (
    (auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text)))
    OR (auth.uid() IN ( SELECT p.usuario_id FROM usuario_permissoes_funcionalidades p
      WHERE (COALESCE((((p.modulos -> 'material-saida'::text) ->> 'edit'::text))::boolean, false) = true)))
  );

CREATE POLICY "material_saidas_delete" ON material_saidas
  FOR DELETE USING (
    (auth.uid() IN ( SELECT u.id FROM profiles u WHERE (u.cargo = 'admin'::text)))
    OR (auth.uid() IN ( SELECT p.usuario_id FROM usuario_permissoes_funcionalidades p
      WHERE (COALESCE((((p.modulos -> 'material-saida'::text) ->> 'delete'::text))::boolean, false) = true)))
  );

-- ============================================================
-- VIEW: vw_fluxo_material (Dashboard de Fluxo de Material)
-- Agrega entradas e saídas por material para exibir estoque atual
-- ============================================================

CREATE OR REPLACE VIEW vw_fluxo_material AS
SELECT
  m.id AS material_id,
  m.nome AS material_nome,
  m.unidade_medida,
  m.estoque_inicial,
  COALESCE(e.total_entradas, 0) AS total_entradas,
  COALESCE(s.total_saidas, 0) AS total_saidas,
  (m.estoque_inicial + COALESCE(e.total_entradas, 0) - COALESCE(s.total_saidas, 0)) AS estoque_atual
FROM materiais m
LEFT JOIN (
  SELECT material_id, SUM(quantidade) AS total_entradas
  FROM material_entradas
  GROUP BY material_id
) e ON e.material_id = m.id
LEFT JOIN (
  SELECT material_id, SUM(quantidade) AS total_saidas
  FROM material_saidas
  GROUP BY material_id
) s ON s.material_id = m.id
WHERE m.ativo = true
ORDER BY m.nome;
