# Guia de Execução

## Instalação

```bash
npm install
npx playwright install
```

## Executar testes

```bash
npm test
```

Em cada `npm test` rodam os quatro projetos: **01-registrar** → **02-consultar** → **03-cancelar** → **04-e2e** (ordem em `playwright.config.ts`).

## Localhost

Se você **não definir** `BASE_URL`, os testes rodarão contra o ambiente de **dev** (padrão: `https://apps.meiosdepagamentobap.dev.awsporto/sboot-fina-mpdp-boleto-orchestrator`). Para rodar em localhost, defina `BASE_URL` com a base **incluindo o context path** (ex.: `http://localhost:8079/sboot-fina-mpdp-boleto-orchestrator`). Sem o path correto, as chamadas não chegam na sua aplicação local.

```powershell
$env:BASE_URL="http://localhost:8079/sboot-fina-mpdp-boleto-orchestrator"; npm test
```

```bash
# Linux/Mac
BASE_URL=http://localhost:8079/sboot-fina-mpdp-boleto-orchestrator npm test
```

## Executar projeto específico

Se desejar rodar apenas um projeto específico, use a flag `--project`:

```bash
# Apenas registrar boleto
npm test -- --project=01-registrar

# Apenas consultar boleto
npm test -- --project=02-consultar

# Apenas cancelar boleto
npm test -- --project=03-cancelar

# Apenas testes e2e
npm test -- --project=04-e2e

# Apenas teste de performance (50 requisições simultâneas)
npm test -- --project=05-performance
```

Com localhost e projeto específico:

```powershell
$env:BASE_URL="http://localhost:8079/sboot-fina-mpdp-boleto-orchestrator"; npm test -- --project=05-performance
```

```bash
# Linux/Mac
BASE_URL=http://localhost:8079/sboot-fina-mpdp-boleto-orchestrator npm test -- --project=05-performance
```

## Teste de Performance (TC018-TC019)

O projeto **05-performance** executa um teste de carga com:

- **TC018**: Gera 50 boletos simultaneamente, aguarda processamento e consulta todos os 50
- **TC019**: Valida estrutura de dados dos boletos consultados

Métricas exibidas: taxa de sucesso, tempo de execução e requisições por segundo.

## Relatório

```bash
npm run report
```

## Se der 404

A mensagem de erro mostra **"URL chamada: …"**. Confira: (1) BASE_URL inclui o context path? (2) O serviço está no ar nessa base?
