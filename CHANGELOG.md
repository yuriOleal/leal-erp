# CHANGELOG - Leal ERP

Todas as alterações notáveis neste projeto serão documentadas neste arquivo com base nas diretrizes do [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-05

### Adicionado
- **Integração Full Stack com Supabase**: Migração completa do localStorage para banco PostgreSQL gerenciado pelo Supabase.
- **Autenticação Real com Supabase Auth**: Login, registro e recuperação de senha com sessões seguras JWT.
- **Row Level Security (RLS)**: Políticas de isolamento por usuário em todas as tabelas (clientes, produtos, vendas, transações).
- **RPC Atômica `create_sale_with_items`**: Função PostgreSQL que executa venda, baixa de estoque e lançamento financeiro em uma única transação.
- **Middleware de Proteção de Rotas**: Redirecionamento automático para /login para usuários não autenticados.
- **Documentação de Repositório Corporativo**: Criação de um `README.md` completo detalhando a arquitetura, stack de tecnologias, fluxogramas, e roadmap de evolução.
- **Padrões de Comunidade**: Adicionado guia de contribuição `CONTRIBUTING.md`, licença pública `LICENSE` (MIT), e este arquivo de versionamento `CHANGELOG.md`.
- **Variáveis de Ambiente Profissionais**: `.env.example` com credenciais Supabase, sem rastros de ferramentas de IA.
- **Limpeza de Código**: Remoção de dependências desnecessárias (`@google/genai`, `firebase-tools`), renomeação do projeto de "ai-studio-applet" para "leal-erp".
- **Validação Final**: Build de produção validado (Next.js 15.5), 8/8 testes passando com Vitest.

---

## [0.7.0] - 2026-06-05

### Adicionado
- **Ambiente de Containerização (DevOps)**: Criação de `Dockerfile` multi-stage otimizado para Next.js (standalone builds em produção) e `docker-compose.yml` para orquestração de microsserviços locais.

---

## [0.6.0] - 2026-06-05

### Adicionado
- **Suíte de Testes Automatizados**: Instalação e configuração de **Vitest** + **React Testing Library** + **JSDOM** via `vitest.config.ts` e `vitest.setup.ts`.
- **Testes Unitários**: Escrita de suíte de testes em `__tests__/app.test.tsx` cobrindo regras críticas de faturamento de vendas, validações de documentos de clientes (CPF/CNPJ), e precificações mínimas.

---

## [0.5.0] - 2026-06-05

### Adicionado
- **Segurança de Inputs**: Criação de schemas de validações com **Zod** (`lib/validations/schemas.ts`) para logins, cadastros de clientes, inserções de produtos e registros de vendas.
- **Formulários Robustos**: Integração de **React Hook Form** + Zod Resolvers em todos os modais interativos e telas de login, prevenindo XSS, inputs vazios ou injeções de dados maliciosos.

---

## [0.4.0] - 2026-06-05

### Adicionado
- **Modais Interativos (CRUDs)**: Desenvolvimento de componentes de modais em `components/modals/`:
  - `client-modal.tsx`: Cadastro/Edição de clientes.
  - `product-modal.tsx`: Cadastro/Edição de produtos no catálogo.
  - `sale-modal.tsx`: Fluxo de pdv rápido para fechar vendas.
  - `transaction-modal.tsx`: Lançamento financeiro avulso (fluxo de caixa).

---

## [0.3.0] - 2026-06-05

### Adicionado
- **Landing Page Institucional Premium**: Criação de Landing Page de conversão no root do projeto (`app/page.tsx`) com design minimalista avançado, seções institucionais de benefícios, prova social, funcionamento, planos comerciais e FAQ dinâmico animado com Framer Motion.
- **Login Dedicado**: Migração da tela original de login para `/login` (`app/login/page.tsx`).

---

## [0.2.0] - 2026-06-05

### Adicionado
- **Gerenciador de Estado Global (`AppContext`)**: Criação de provedor de dados `AppContext` em `lib/context/AppContext.tsx` integrado com `localStorage` para simular banco de dados e transações relacionais na memória do browser.
- **Tipagem Unificada**: Criação do arquivo de tipos centrais em `types/index.ts`.
- **Modificações de Páginas**: Refatoração de todo o dashboard e abas para consumirem dados reativos em tempo real baseados nas interações do usuário.

---

## [0.1.0] - 2026-06-05

### Adicionado
- **Importação de Código**: Upload e importação inicial do projeto base Leal ERP em Next.js com Tailwind CSS v4 e Shadcn.
