# Guia de Contribuição - Leal ERP

Obrigado por seu interesse em contribuir para o **Leal ERP**! Como um projeto de alto nível corporativo, seguimos padrões técnicos rígidos para garantir a segurança, performance e manutenibilidade do código.

---

## 🛠️ Stack Tecnológica
- **Framework**: Next.js 15 (App Router)
- **Estilo**: Tailwind CSS (v4) & Shadcn UI
- **Animações**: Framer Motion
- **Validação**: Zod & React Hook Form
- **Testes**: Vitest & React Testing Library
- **Estado**: React Context (simulando camada de persistência)

---

## 📂 Padrão de Arquitetura de Pastas
Mantenha a organização estruturada por responsabilidades claras:
- `/app`: Roteamento e layouts (App Router).
- `/components`: Componentes reutilizáveis compartilhados.
- `/components/modals`: Modais de CRUDs e interações específicas.
- `/components/ui`: Componentes atômicos de interface (Shadcn base).
- `/lib/context`: Provedores de estado e cache (ex: `AppContext.tsx`).
- `/lib/validations`: Schemas de validação de dados com Zod.
- `/types`: Definições TypeScript globais.
- `/__tests__`: Suítes de testes unitários e de integração.

---

## 💬 Boas Práticas de Código & Qualidade
Seguimos os princípios de **Clean Code**, **SOLID**, **KISS** (Keep It Simple, Stupid) e **DRY** (Don't Repeat Yourself).

### Diretrizes:
1. **Componentização Focada**: Evite arquivos gigantes. Se um componente passar de 250 linhas, divida-o em subcomponentes ou hooks customizados.
2. **Tipagem Estrita**: Não utilize `any` sob hipótese alguma. Todos os contratos devem ser devidamente tipados em `/types/index.ts`.
3. **Validação de Formulários**: Todos os formulários client-side devem possuir validação de inputs via schema Zod correspondente em `/lib/validations/schemas.ts`.
4. **Sem Secrets Hardcoded**: Chaves de API, segredos ou URLs de banco de dados devem ser declaradas em `.env.local` e adicionadas ao `.env.example`.

---

## 🌿 Fluxo de Git e Commits
Seguimos a convenção de **Conventional Commits** para manter o histórico claro e possibilitar versionamento semântico (`SemVer`):

### Estrutura da Mensagem de Commit:
```
<tipo>(<escopo>): <descrição curta em português>
```

### Principais Tipos:
- `feat`: Adição de nova funcionalidade (ex: `feat(sale): adicionar cálculo dinâmico de impostos`).
- `fix`: Correção de bug (ex: `fix(auth): corrigir loop de redirecionamento no login`).
- `docs`: Atualizações na documentação (ex: `docs(readme): detalhar configuração do Docker`).
- `style`: Alterações estéticas que não afetam a lógica (ex: `style(sidebar): alinhar ícone de configurações`).
- `refactor`: Refatorações de código que não mudam comportamento (ex: `refactor(context): otimizar cálculos de lucros`).
- `test`: Criação ou ajuste de testes (ex: `test(auth): adicionar testes para formulário de login`).
- `chore`: Atualização de dependências ou build (ex: `chore(deps): atualizar pacote zod`).

---

## 🧪 Práticas de Testes
Toda nova regra de negócio crítica adicionada ao sistema deve vir acompanhada de um teste correspondente em `__tests__/`.

- Para rodar a suíte de testes locais:
  ```bash
  npm run test
  ```
- Garanta que todos os testes passem com sucesso antes de abrir um Pull Request.
