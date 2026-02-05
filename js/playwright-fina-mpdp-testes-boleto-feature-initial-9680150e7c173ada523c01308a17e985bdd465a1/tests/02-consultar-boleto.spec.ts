/**
 * Testes do endpoint: Consultar Boleto
 * TC013 - TC017
 *
 * Fluxo necessário: (1) gerar boleto, (2) salvar numeroBoleto, (3) executar a API de consultar-boleto.
 * O beforeEach garante esse pré-requisito para cada teste que consulta por numeroBoleto.
 */

import {test, expect} from '../src/fixtures/api-fixtures';
import {UuidGenerator} from '../src/helpers/uuid-generator';
import {TestDataBuilder} from '../src/helpers/test-data-builder';
import type {ConsultarBoletoResponse} from '../src/types/api/consultar-boleto.types';

test.describe('Consultar Boleto', () => {
  let numeroBoletoRegistrado: string;
  let correlationId: string;

  test.beforeEach(async ({boletoClient}) => {
    // 1) Gerar boleto e 2) salvar numeroBoleto para usar na API de consultar
    correlationId = UuidGenerator.generate();
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(true);
    expect((response.body as {numeroBoleto?: string}).numeroBoleto).toBeTruthy();
    numeroBoletoRegistrado = (response.body as {numeroBoleto: string}).numeroBoleto;
    await new Promise(resolve => setTimeout(resolve, 800));
  });

  test('TC013: Consultar boleto com sucesso (com eventos)', async ({boletoClient}) => {
    let response;
    for (let attempt = 0; attempt < 6; attempt++) {
      response = await boletoClient.consultarBoleto(
        {numeroBoleto: numeroBoletoRegistrado, buscarEventos: true},
        {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId},
      );
      if (response.ok) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    expect(response!.ok).toBe(true);
    expect(response!.status).toBe(200);
    const body = response!.body as ConsultarBoletoResponse;
    expect(body.boleto).toBeDefined();
    expect(body.boleto.valor).toBeGreaterThan(0);
    expect(body.boleto.dataVencimento).toBeTruthy();
    expect(body.boletoEventos).toBeDefined();
    expect(Array.isArray(body.boletoEventos)).toBe(true);
    expect(body.boletoEventos.length).toBeGreaterThan(0);
  });

  test('TC014: Consultar boleto com sucesso (sem eventos)', async ({boletoClient}) => {
    let response;
    for (let attempt = 0; attempt < 6; attempt++) {
      response = await boletoClient.consultarBoleto(
        {numeroBoleto: numeroBoletoRegistrado, buscarEventos: false},
        {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId},
      );
      if (response.ok) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    expect(response!.ok).toBe(true);
    expect(response!.status).toBe(200);
    const body = response!.body as ConsultarBoletoResponse;
    expect(body.boleto).toBeDefined();
    expect(body.boleto.valor).toBeGreaterThan(0);
    expect(body.boleto.dataVencimento).toBeTruthy();
    expect(body.boletoEventos).toBeDefined();
  });

  test('TC015: Erro - numeroBoleto não informado', async ({boletoClient}) => {
    const response = await boletoClient.consultarBoleto(
      {numeroBoleto: '', buscarEventos: true},
      {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId},
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  test('TC016: Erro - buscarEventos não informado', async ({request}) => {
    const baseUrl =
      process.env.BASE_URL ?? 'https://apps.meiosdepagamentobap.dev.awsporto/sboot-fina-mpdp-boleto-orchestrator';
    const response = await request.get(`${baseUrl}/api/boleto?numeroBoleto=abc123`, {
      headers: {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId},
    });
    expect(response.status()).toBe(400);
  });

  test('TC017: Erro - boleto não encontrado', async ({boletoClient}) => {
    const response = await boletoClient.consultarBoleto(
      {numeroBoleto: 'BOLETO_INEXISTENTE_12345', buscarEventos: true},
      {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId},
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });
});
