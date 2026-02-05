/**
 * Testes do endpoint: Cancelar Boleto
 * TC018 - TC026
 *
 * Fluxo necessário: (1) gerar boleto, (2) pegar numeroBoleto, (3) executar a API de cancelamento.
 * O beforeEach garante esse pré-requisito para cada teste que cancela por numeroBoleto.
 */

import {test, expect} from '../src/fixtures/api-fixtures';
import {UuidGenerator} from '../src/helpers/uuid-generator';
import {TestDataBuilder} from '../src/helpers/test-data-builder';
import {ApiErrorResponse} from '../src/types/common/response.types';

test.describe('Cancelar Boleto', () => {
  let numeroBoletoParaCancelar: string;
  let correlationId: string;

  test.beforeEach(async ({boletoClient}) => {
    // 1) Gerar boleto e 2) pegar numeroBoleto para usar na API de cancelar
    correlationId = UuidGenerator.generate();
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(true);
    expect((response.body as {numeroBoleto?: string}).numeroBoleto).toBeTruthy();
    numeroBoletoParaCancelar = (response.body as {numeroBoleto: string}).numeroBoleto;
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  test('TC018: Cancelar boleto com sucesso (ONLINE)', async ({boletoClient}) => {
    const response = await boletoClient.cancelarBoleto(
      {numeroBoleto: numeroBoletoParaCancelar},
      {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId, TipoProcessamento: 'ONLINE'},
    );

    expect(response.ok).toBe(true);
    expect(response.status).toBe(202);
    expect(response.body.codigo).toBe('202');
    expect(response.body.mensagem).toMatch(/cancelamento.*sucesso|sucesso.*cancelamento/i);
    expect(response.body.correlationId).toBe(correlationId);
  });

  test('TC019: Cancelar boleto com sucesso (BATCH)', async ({boletoClient}) => {
    const response = await boletoClient.cancelarBoleto(
      {numeroBoleto: numeroBoletoParaCancelar},
      {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId, TipoProcessamento: 'BATCH'},
    );

    expect(response.ok).toBe(true);
    expect(response.status).toBe(202);
    expect(response.body.codigo).toBe('202');
    expect(response.body.mensagem).toMatch(/cancelamento.*sucesso|sucesso.*cancelamento/i);
    expect(response.body.correlationId).toBe(correlationId);
  });

  test('TC020: Erro - numeroBoleto não informado', async ({boletoClient}) => {
    const response = await boletoClient.cancelarBoleto(
      {numeroBoleto: ''},
      {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId, TipoProcessamento: 'ONLINE'},
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const errorBody = response.body as ApiErrorResponse;
    expect(errorBody.mensagem).toMatch(/obrigatório|numeroBoleto/i);
  });

  test('TC021: Erro - numeroBoleto ausente no payload', async ({boletoClient}) => {
    const response = await boletoClient.cancelarBoleto({} as any, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      TipoProcessamento: 'ONLINE',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  test('TC022: Erro - X-Correlation-ID não informado', async ({boletoClient}) => {
    const response = await boletoClient.cancelarBoleto({numeroBoleto: 'test123'}, {
      'Content-Type': 'application/json',
      TipoProcessamento: 'ONLINE',
    } as any);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  test('TC023: Erro - TipoProcessamento não informado', async ({boletoClient}) => {
    const response = await boletoClient.cancelarBoleto({numeroBoleto: 'test123'}, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
    } as any);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  test('TC024: Erro - Duplicidade de cancelamento', async ({boletoClient}) => {
    const firstResponse = await boletoClient.cancelarBoleto(
      {numeroBoleto: numeroBoletoParaCancelar},
      {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId, TipoProcessamento: 'ONLINE'},
    );

    expect(firstResponse.ok).toBe(true);
    expect(firstResponse.body.codigo).toBe('202');
    await new Promise(resolve => setTimeout(resolve, 200));

    const secondResponse = await boletoClient.cancelarBoleto(
      {numeroBoleto: numeroBoletoParaCancelar},
      {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId, TipoProcessamento: 'ONLINE'},
    );

    expect(secondResponse.ok).toBe(false);
    expect(secondResponse.status).toBe(422);
    const errorBody = secondResponse.body as ApiErrorResponse;
    expect(errorBody.mensagem).toMatch(/duplicad|já está sendo processada/i);
  });

  test('TC025: Erro - Cancelar boleto inexistente', async ({boletoClient}) => {
    const response = await boletoClient.cancelarBoleto(
      {numeroBoleto: 'BOLETO_INEXISTENTE_12345'},
      {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId, TipoProcessamento: 'ONLINE'},
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });

  test('TC026: Erro - TipoProcessamento inválido', async ({boletoClient}) => {
    const response = await boletoClient.cancelarBoleto(
      {numeroBoleto: 'test123'},
      {'Content-Type': 'application/json', 'X-Correlation-ID': correlationId, TipoProcessamento: 'INVALIDO' as any},
    );

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });
});
