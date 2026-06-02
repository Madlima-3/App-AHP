# Sistema de Priorização de Manutenção Ferroviária

Aplicativo web para configuração de metodologia de priorização de manutenção de infraestrutura ferroviária usando o método AHP (Analytic Hierarchy Process).

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **SQLite** via Prisma ORM
- **Tailwind CSS** + componentes shadcn/ui
- **xlsx** para exportação Excel

## O que o app faz

1. Cria tipos de ativo (Bueiro, Talude, Cortina Atirantada, etc.)
2. Define critérios de avaliação e suas escalas de valor
3. Preenche matrizes AHP com validação de consistência (RC ≤ 0.10)
4. Gera pesos auditáveis via método AHP
5. Exporta configuração em Excel (6 abas) para uso em sistema externo
6. Mantém histórico de versões com comparação lado a lado

## Desenvolvimento

```bash
npm install
npm run db:migrate     # cria banco SQLite e roda migrations
npm run dev            # inicia em http://localhost:3000
npm test               # roda testes unitários da lógica AHP
```

## Estrutura

```
app/                   # Next.js App Router (páginas e APIs)
components/            # Componentes React (Wizard, MatrizAHP, etc.)
lib/                   # Lógica de negócio (ahp.ts, scoring.ts, export.ts)
prisma/                # Schema e migrations SQLite
types/                 # Interfaces TypeScript
__tests__/             # Testes unitários
```

## Critérios de Aceite V1

- [x] Criar tipo de ativo com nome, descrição e max patologias
- [x] Adicionar critérios com escalas de valor customizadas
- [x] Preencher matriz AHP com cálculo em tempo real
- [x] Validação de consistência com feedback visual (RC)
- [x] Salvar como rascunho ou ativar versão
- [x] Versionamento automático com histórico
- [x] Comparação lado a lado entre versões
- [x] Reativar versão anterior
- [x] Exportar Excel com 6 abas estruturadas
- [x] Flag de alerta quando patologias excedem o máximo configurado
