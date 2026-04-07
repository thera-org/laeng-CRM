# Sistema de Gestão de Engenharia - Laeng CRM

## 📋 Visão Geral

Sistema completo de gestão para construtoras desenvolvido com Next.js 15 React 19, TypeScript, Tailwind CSS e Supabase. O sistema oferece controle total de clientes, obras, contratos e finanças com visualizações avançadas e análises de dados.

## 🎨 Identidade Visual

O sistema utiliza a identidade visual do cliente com cores principais:
- **Amarelo**: #F5C800 (cor primária)
- **Preto**: #1E1E1E (cor secundária)
- Paleta complementar com tons de cinza e cores de status

## 🚀 Funcionalidades Implementadas

### 1. Dashboard Principal
- **Métricas em tempo real**:
  - Total de clientes cadastrados
  - Obras ativas e finalizadas
  - Total de contratos
  - Receita total calculada

- **Gráficos e Análises**:
  - Faturamento x Fase (gráfico de barras)
  - Obras x Fase (gráfico de pizza)
  - Faturamento x Ano (gráfico de linha)
  - Obra x Ano (gráfico de linha)
  - Locais de Obra (gráfico de linha)
  - Locais de Obra x Valor (gráfico de linha)

### 2. Gestão de Clientes
- Cadastro completo de clientes
- Listagem com busca e filtros
- Edição e exclusão de registros
- Campos: Nome, CPF/CNPJ, Telefone, Email, Endereço completo, Observações

### 3. Gestão de Obras
Módulo completo baseado na planilha do cliente com todos os campos:
- **Código** (COD): Identificador único da obra
- **Nome do Cliente**: Cliente responsável pela obra
- **Responsável**: Profissional responsável pela obra
- **Entidade**: Entidade financiadora (S.J., CUS., etc.)
- **Endereço**: Localização completa da obra
- **Status**: FINALIZADO ou EM ANDAMENTO
- **Entrada**: Valor de entrada (R$)
- **Valor Financiado**: Valor financiado pela instituição (R$)
- **Subsídio**: Valor de subsídio recebido (R$)
- **Valor Total**: Calculado automaticamente (Entrada + Financiado + Subsídio)
- **Data de Conclusão**: Data de finalização da obra
- **Valor do Terreno**: Investimento em terreno (R$)
- **Ano da Obra**: Ano de execução
- **Local da Obra**: Bairro/região
- **Fase**: Fase atual do projeto

**Funcionalidades**:
- Cálculo automático do valor total
- Formulário completo com validações
- Listagem com filtros e ordenação
- Edição e exclusão de obras
- Status visual com badges coloridos

### 4. Gestão Financeira
Dashboard financeiro completo com:
- **Métricas Financeiras**:
  - Total de receitas
  - Obras finalizadas (receita)
  - Obras em andamento (receita)
  - Total de subsídios

- **Detalhamento**:
  - Total de entradas
  - Valor financiado total
  - Valor investido em terrenos

- **Gráficos de Análise**:
  - Distribuição de valores (pizza)
  - Faturamento por responsável (barras)
  - Evolução mensal (linha temporal)

### 5. Gestão de Contratos
- CRUD completo de contratos
- Vinculação com clientes e obras
- Controle de datas e valores
- Status de contratos

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

#### `profiles`
Perfis de usuários vinculados ao auth.users do Supabase:
- `id` (UUID, PK)
- `nome_completo` (TEXT)
- `cargo` (TEXT: 'admin' | 'funcionario')
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### `clientes`
Cadastro de clientes:
- `id` (UUID, PK)
- `codigo` (INTEGER, UNIQUE)
- `nome` (TEXT)
- `cpf_cnpj`, `telefone`, `email` (TEXT)
- `endereco`, `cidade`, `estado`, `cep` (TEXT)
- `observacoes` (TEXT)
- `created_by` (UUID, FK)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### `obras`
Gestão completa de obras:
- `id` (UUID, PK)
- `codigo` (INTEGER, UNIQUE)
- `cliente_nome` (TEXT)
- `responsavel` (TEXT)
- `entidade` (TEXT)
- `endereco` (TEXT)
- `status` (TEXT: 'FINALIZADO' | 'EM ANDAMENTO')
- `entrada` (NUMERIC)
- `valor_financiado` (NUMERIC)
- `subsidio` (NUMERIC)
- `valor_total` (NUMERIC)
- `data_conclusao` (DATE)
- `valor_terreno` (NUMERIC)
- `ano_obra` (INTEGER)
- `local_obra` (TEXT)
- `fase` (TEXT)
- `created_by` (UUID, FK)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### `contratos`
Contratos e acordos:
- `id` (UUID, PK)
- `cliente_id`, `obra_id` (UUID, FK)
- `data_inicio`, `data_conclusao` (DATE)
- `local_obra` (TEXT)
- `valor_total` (NUMERIC)
- `responsavel` (TEXT)
- `tipo_pagamento` (TEXT: 'Caixa' | 'Particular')
- `status` (TEXT: 'Em andamento' | 'Concluído' | 'Cancelado')
- `observacoes` (TEXT)
- `created_by` (UUID, FK)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### `financeiro`
Movimentações financeiras:
- `id` (UUID, PK)
- `obra_id` (UUID, FK)
- `tipo` (TEXT: 'entrada' | 'saida' | 'pagamento' | 'recebimento')
- `descricao` (TEXT)
- `valor` (NUMERIC)
- `data_movimentacao` (DATE)
- `categoria`, `forma_pagamento` (TEXT)
- `observacoes` (TEXT)
- `created_by` (UUID, FK)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### Triggers Implementados
- Atualização automática de `updated_at` em todas as tabelas
- Criação automática de perfil ao registrar novo usuário

### Row Level Security (RLS)
Todas as tabelas possuem RLS habilitado com políticas para usuários autenticados:
- SELECT: Todos os usuários autenticados
- INSERT: Todos os usuários autenticados
- UPDATE: Todos os usuários autenticados
- DELETE: Todos os usuários autenticados

## 🎨 Componentes Criados

### Dashboard
- `dashboard-charts.tsx`: Gráficos do dashboard principal
- `financeiro-chart.tsx`: Gráficos financeiros

### Obras
- `obra-form.tsx`: Formulário completo de obras
- `obras-table.tsx`: Tabela de listagem de obras

### Clientes
- `cliente-form.tsx`: Formulário de clientes
- `clientes-table.tsx`: Tabela de clientes

### Contratos
- `contrato-form.tsx`: Formulário de contratos
- `contratos-table.tsx`: Tabela de contratos

### UI Components
Sistema completo de componentes UI do Shadcn/ui incluindo:
- Cards, Buttons, Inputs, Selects
- Tables, Dialogs, Alerts
- Charts (Recharts)
- Badges, Tooltips, etc.

## 📊 Bibliotecas de Gráficos

Utiliza **Recharts** (v2.15.4) para todos os gráficos:
- BarChart: Gráficos de barras
- LineChart: Gráficos de linha
- PieChart: Gráficos de pizza
- Componentes: CartesianGrid, XAxis, YAxis, Tooltip, Legend

## 🔐 Autenticação

Sistema de autenticação completo com Supabase Auth:
- Login e cadastro
- Página de sucesso pós-cadastro
- Logout com rota dedicada
- Proteção de rotas com middleware
- Criação automática de perfil

## 🎯 Rotas Principais

```
/                           → Página inicial (redireciona para /dashboard)
/auth/login                 → Login
/auth/cadastro              → Cadastro
/auth/cadastro-sucesso      → Confirmação de cadastro
/auth/signout               → Logout

/dashboard                  → Dashboard principal

/clientes                   → Listagem de clientes
/clientes/[id]              → Perfil do cliente

/obras                      → Listagem de obras

/financeira                 → Dashboard financeiro

/dashboard/contratos        → Listagem de contratos
/dashboard/contratos/novo   → Novo contrato
/dashboard/contratos/[id]/editar → Editar contrato
```

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 15.2.4 com App Router
- **React**: 19
- **TypeScript**: 5
- **Estilização**: Tailwind CSS 4.1.9
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Gráficos**: Recharts 2.15.4
- **UI Components**: Shadcn/ui + Radix UI
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React
- **Gerenciador**: npm

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm run start

# Lint
npm run lint
```

## 🔧 Configuração do Projeto

### Variáveis de Ambiente
Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tiknxcrzmrgnrntlltmt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### Instalação

```bash
# Instalar dependências
npm install

# Configurar banco de dados (já criado via MCP)
# As tabelas, triggers e políticas RLS já foram criadas

# Executar projeto
npm run dev
```

## 📈 Próximas Melhorias Sugeridas

1. **Relatórios em PDF**: Geração de relatórios financeiros e de obras
2. **Upload de Documentos**: Anexar documentos às obras e contratos
3. **Notificações**: Sistema de alertas para prazos e vencimentos
4. **Dashboard Personalizado**: Widgets customizáveis por usuário
5. **Exportação de Dados**: Excel/CSV das listagens
6. **Filtros Avançados**: Busca por múltiplos critérios
7. **Gestão de Usuários**: Painel administrativo de usuários
8. **Auditoria**: Log de alterações em registros
9. **API REST**: Endpoints para integrações externas
10. **Mobile App**: Aplicativo mobile com React Native

## 🎨 Customização de Tema

O tema está configurado em `app/globals.css` com variáveis CSS:
- `--primary`: #F5C800 (amarelo)
- `--sidebar`: #1E1E1E (preto)
- Todas as cores podem ser ajustadas neste arquivo

## 📱 Responsividade

O sistema é totalmente responsivo com:
- Layout adaptativo para mobile, tablet e desktop
- Sidebar colapsável no desktop
- Menu hambúrguer no mobile
- Tabelas com scroll horizontal
- Gráficos responsivos

## 🔒 Segurança

- Row Level Security (RLS) em todas as tabelas
- Autenticação obrigatória para acesso ao dashboard
- Middleware para proteção de rotas
- Validação de formulários com Zod
- Sanitização de inputs

## 📄 Licença

Este projeto é proprietário e confidencial.

---

**Desenvolvido para**: Laeng - Setor Escritório  
**Data**: Janeiro 2025  
**Versão**: 1.0.0
