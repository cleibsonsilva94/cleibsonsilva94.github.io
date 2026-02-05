# Playwright - Testes Automatizados Orquestrador de Boletos

Projeto de testes automatizados para a API do Orquestrador de Boletos utilizando Playwright.

## 📁 Estrutura do Projeto

```
src/
├── clients/                    # Clientes HTTP
│   └── boleto-orchestrator-client.ts
│
├── helpers/                    # Helpers e utilitários
│   ├── assert-api-response.ts
│   ├── test-data-builder.ts
│   └── uuid-generator.ts
│
├── types/                      # Tipos TypeScript
│   ├── api/                   # Tipos da API
│   ├── common/                # Tipos comuns
│   └── domain/                # Tipos de domínio
│
└── fixtures/                   # Fixtures do Playwright
    └── api-fixtures.ts

tests/                          # Testes Playwright (ordem: registro → consulta → cancelamento → e2e)
    ├── 01-registrar-boleto.spec.ts
    ├── 02-consultar-boleto.spec.ts
    ├── 03-cancelar-boleto.spec.ts
    └── e2e/
        └── fluxos-completos.spec.ts
```

## 🏗️ Arquitetura

Estrutura simples e direta, adequada para projetos de testes automatizados:

- **clients/**: Clientes HTTP que fazem comunicação com a API externa
- **helpers/**: Utilitários e builders para construção de dados de teste
- **types/**: Tipos TypeScript organizados por contexto
- **fixtures/**: Configurações e fixtures do Playwright

## 🚀 Como Executar

Para passos rápidos (localhost, 404), veja **GUIA_EXECUCAO.md**.

### 1. Instalação Inicial

```bash
# Instalar dependências do projeto
npm install

# Instalar browsers do Playwright (Chrome, Firefox, Safari)
npx playwright install
```

### 2. Executar Testes

```bash
# Executar TODOS os testes
npm test

# Executar testes em modo UI (interativo)
npx playwright test --ui

# Executar testes específicos (ordem: registro → consulta → cancelamento)
npx playwright test tests/01-registrar-boleto.spec.ts
npx playwright test tests/02-consultar-boleto.spec.ts
npx playwright test tests/03-cancelar-boleto.spec.ts

# Executar apenas testes E2E
npx playwright test tests/e2e/

# Executar testes em modo debug
npx playwright test --debug
```

### 3. Ver Relatórios

```bash
# Ver relatório HTML após execução
npm run report

# Ou abrir diretamente
npx playwright show-report
```

## 📝 Exemplo de Uso

```typescript
import {test, expect} from '../src/fixtures/api-fixtures';
import {UuidGenerator} from '../src/helpers/uuid-generator';
import {TestDataBuilder} from '../src/helpers/test-data-builder';

test('Registrar boleto', async ({boletoClient}) => {
  const correlationId = UuidGenerator.generate();
  const payload = TestDataBuilder.createRegistrarBoletoPayload();

  const response = await boletoClient.registrarBoleto(payload, {
    'Content-Type': 'application/json',
    'X-Correlation-ID': correlationId,
    'Tipo-processamento': 'ONLINE',
  });

  expect(response.body.codigo).toBe('202');
  expect(response.body.numeroBoleto).toBeTruthy();
});
```

## 📦 Dependências

- `@playwright/test`: Framework de testes
- `@types/node`: Tipos TypeScript para Node.js

## 📄 Licença

ISC
