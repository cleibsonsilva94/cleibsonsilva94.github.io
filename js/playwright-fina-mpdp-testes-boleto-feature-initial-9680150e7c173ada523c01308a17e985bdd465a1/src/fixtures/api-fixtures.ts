/**
 * Fixtures do Playwright para configuração da API
 *
 * Para apontar para localhost, defina BASE_URL com a base completa incluindo o context path.
 * Ex.: orquestrador em http://localhost:8079/sboot-fina-mpdp-boleto-orchestrator
 *   PowerShell: $env:BASE_URL="http://localhost:8079/sboot-fina-mpdp-boleto-orchestrator"; npm test
 *   CMD:        set BASE_URL=http://localhost:8079/sboot-fina-mpdp-boleto-orchestrator && npm test
 *   Linux/Mac:  BASE_URL=http://localhost:8079/sboot-fina-mpdp-boleto-orchestrator npm test
 *
 * Sem o context path, as chamadas iriam para http://localhost:8079/api/boletos e não chegariam na aplicação.
 */

import {test as base} from '@playwright/test';
import {BoletoOrchestratorClient, IBoletoOrchestratorClient} from '../clients/boleto-orchestrator-client';

const DEFAULT_BASE_URL = 'https://apps.meiosdepagamentobap.dev.awsporto/sboot-fina-mpdp-boleto-orchestrator';

function getBaseUrl(): string {
  return process.env.BASE_URL ?? DEFAULT_BASE_URL;
}

type ApiFixtures = {
  boletoClient: IBoletoOrchestratorClient;
  baseURL: string;
};

export const test = base.extend<ApiFixtures>({
  baseURL: async ({}, use) => {
    await use(getBaseUrl());
  },

  boletoClient: async ({request, baseURL}, use) => {
    const client = new BoletoOrchestratorClient(request, baseURL);
    await use(client);
  },
});

export {expect} from '@playwright/test';
