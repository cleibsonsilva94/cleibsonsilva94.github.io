/**
 * Testes do endpoint: Registrar Boleto
 * TC001 - TC013
 *
 * Executado primeiro no fluxo: registro → consulta → cancelamento.
 */

import {test, expect} from '../src/fixtures/api-fixtures';
import {UuidGenerator} from '../src/helpers/uuid-generator';
import {TestDataBuilder} from '../src/helpers/test-data-builder';
import {assertApiSuccess} from '../src/helpers/assert-api-response';
import {ApiErrorResponse} from '../src/types/common/response.types';
import type {RegistrarBoletoResponse} from '../src/types/api/registrar-boleto.types';

test.describe('Registrar Boleto', () => {
  let correlationId: string;

  test.beforeEach(() => {
    correlationId = UuidGenerator.generate();
  });

  test('TC001: Registrar boleto com sucesso (ONLINE)', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    assertApiSuccess(response, 'TC001 - Registrar boleto (ONLINE)');
    expect(response.status).toBe(202);
    expect(response.body.codigo).toBe('202');
    expect(response.body.mensagem).toBe('Processo de registro do boleto iniciado com sucesso');
    expect(response.body.correlationId).toBe(correlationId);
    const body = response.body as RegistrarBoletoResponse;
    expect(body.numeroBoleto).toBeTruthy();
    expect(typeof body.numeroBoleto).toBe('string');
    expect(body.numeroBoleto.length).toBeGreaterThan(0);
  });

  test('TC002: Registrar boleto com sucesso (BATCH)', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'BATCH',
    });

    assertApiSuccess(response, 'TC002 - Registrar boleto (BATCH)');
    expect(response.status).toBe(202);
    expect(response.body.codigo).toBe('202');
    expect(response.body.mensagem).toBe('Processo de registro do boleto iniciado com sucesso');
    expect(response.body.correlationId).toBe(correlationId);
    const body = response.body as RegistrarBoletoResponse;
    expect(body.numeroBoleto).toBeTruthy();
    expect(typeof body.numeroBoleto).toBe('string');
    expect(body.numeroBoleto.length).toBeGreaterThan(0);
  });

  test('TC003: Erro - idExterno não informado', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadSemIdExterno() as any;

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const errorBody = response.body as ApiErrorResponse;
    expect(errorBody.mensagem).toContain('ID externo');
    expect(errorBody.codigo).toBe('4001000');
  });

  test('TC004: Erro - codProduto não informado', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadSemCodProduto() as any;

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const errorBody = response.body as ApiErrorResponse;
    expect(errorBody.mensagem).toContain('produto');
  });

  test('TC005: Erro - pagador não informado', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadSemPagador() as any;

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const errorBody = response.body as ApiErrorResponse;
    expect(errorBody.mensagem).toContain('pagador');
  });

  test('TC006: Erro - boleto não informado', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadSemBoleto() as any;

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const errorBody = response.body as ApiErrorResponse;
    expect(errorBody.mensagem).toContain('boleto');
  });

  test('TC007: Erro - X-Correlation-ID não informado', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'Tipo-processamento': 'ONLINE',
    } as any);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  test('TC008: Erro - Tipo-processamento não informado', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
    } as any);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  test('TC009: Erro - Duplicidade de registro', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    // Primeiro registro
    const firstResponse = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(firstResponse.ok).toBe(true);
    expect(firstResponse.body.codigo).toBe('202');

    // Aguarda um pouco para evitar problemas de concorrência
    await new Promise(resolve => setTimeout(resolve, 200));

    // Tentativa de registro duplicado
    const secondResponse = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(secondResponse.ok).toBe(false);
    expect(secondResponse.status).toBe(422);
    const errorBody = secondResponse.body as ApiErrorResponse;
    expect(errorBody.mensagem).toMatch(/duplicad|já está sendo processada/i);
  });

  test('TC010: Erro - CPF com quantidade de dígitos inválida', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayload({
      pagador: TestDataBuilder.createPagador({
        tipoDocumento: 'CPF',
        numeroDocumento: '51099188806123', // 14 dígitos; CPF exige 11
      }),
    });

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const errorBody = response.body as ApiErrorResponse;
    expect(errorBody.codigo).toBe('4001000');
    expect(errorBody.mensagem).toMatch(/CPF.*11 dígitos|11 dígitos/i);
  });

  test('TC011: Erro - CNPJ com quantidade de dígitos inválida', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayload({
      pagador: TestDataBuilder.createPagador({
        tipoDocumento: 'CNPJ',
        numeroDocumento: '123456780001', // 12 dígitos; CNPJ exige 14
      }),
    });

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const errorBody = response.body as ApiErrorResponse;
    expect(errorBody.codigo).toBe('4001000');
    expect(errorBody.mensagem).toMatch(/CNPJ.*14 dígitos|14 dígitos/i);
  });

  test('TC012: Erro - dataVencimento no passado', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico({
      boleto: TestDataBuilder.createBoletoDataPassado(),
    });

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const errorBody = response.body as ApiErrorResponse;
    expect(errorBody.mensagem).toMatch(/data|vencimento|passado/i);
  });

  test('TC013: Erro - valor do boleto negativo', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico({
      boleto: TestDataBuilder.createBoletoValorNegativo(),
    });

    const response = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    const errorBody = response.body as ApiErrorResponse;
    expect(errorBody.mensagem).toMatch(/valor|negativo/i);
  });
});
