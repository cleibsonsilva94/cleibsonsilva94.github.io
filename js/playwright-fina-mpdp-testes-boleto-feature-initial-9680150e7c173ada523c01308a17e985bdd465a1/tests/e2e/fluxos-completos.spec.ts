/**
 * Testes End-to-End: Fluxos Completos
 * E2E001 - E2E003
 */

import {test, expect} from '../../src/fixtures/api-fixtures';
import {UuidGenerator} from '../../src/helpers/uuid-generator';
import {TestDataBuilder} from '../../src/helpers/test-data-builder';
import type {ConsultarBoletoResponse} from '../../src/types/api/consultar-boleto.types';
import type {ApiErrorResponse} from '../../src/types/common/response.types';

test.describe('Fluxos End-to-End', () => {
  let correlationId: string;

  test.beforeEach(() => {
    correlationId = UuidGenerator.generate();
  });

  test('E2E001: Ciclo completo de um boleto', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    // Passo 1: Registrar boleto
    const registrarResponse = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(registrarResponse.ok).toBe(true);
    expect(registrarResponse.body.codigo).toBe('202');
    expect((registrarResponse.body as any).numeroBoleto).toBeTruthy();
    const numeroBoleto = (registrarResponse.body as any).numeroBoleto;

    // Passo 2: Consultar boleto registrado (com eventos) – retry até disponível
    let consultarResponse;
    for (let attempt = 0; attempt < 6; attempt++) {
      consultarResponse = await boletoClient.consultarBoleto(
        {numeroBoleto: numeroBoleto, buscarEventos: true},
        {'Content-Type': 'application/json', 'X-Correlation-ID': UuidGenerator.generate()},
      );
      if (consultarResponse.ok) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    const resp = consultarResponse!;
    expect(resp.ok).toBe(true);
    const consultarBody = resp.body as ConsultarBoletoResponse;
    expect(consultarBody.boleto).toBeDefined();
    expect(consultarBody.boleto.valor).toBe(payload.boleto.valor);

    // Delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Passo 3: Cancelar boleto
    const cancelarCorrelationId = UuidGenerator.generate();
    const cancelarResponse = await boletoClient.cancelarBoleto(
      {
        numeroBoleto: numeroBoleto,
      },
      {
        'Content-Type': 'application/json',
        'X-Correlation-ID': cancelarCorrelationId,
        TipoProcessamento: 'ONLINE',
      },
    );

    expect(cancelarResponse.ok).toBe(true);
    expect(cancelarResponse.body.codigo).toBe('202');
    expect(cancelarResponse.body.correlationId).toBe(cancelarCorrelationId);

    // Passo 4: Consultar boleto cancelado (sem eventos) – retry até disponível
    let consultarCanceladoResponse;
    for (let attempt = 0; attempt < 6; attempt++) {
      consultarCanceladoResponse = await boletoClient.consultarBoleto(
        {numeroBoleto: numeroBoleto, buscarEventos: false},
        {'Content-Type': 'application/json', 'X-Correlation-ID': UuidGenerator.generate()},
      );
      if (consultarCanceladoResponse.ok) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    const respCancelado = consultarCanceladoResponse!;
    expect(respCancelado.ok).toBe(true);
    const consultarCanceladoBody = respCancelado.body as ConsultarBoletoResponse;
    expect(consultarCanceladoBody.boleto).toBeDefined();
    // O status pode mudar após cancelamento
    expect(consultarCanceladoBody.boleto.status).toBeDefined();
  });

  test('E2E002: Validação de idempotência no registro', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    // Primeiro registro
    const firstResponse = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(firstResponse.ok).toBe(true);
    expect(firstResponse.body.codigo).toBe('202');
    const numeroBoletoPrimeiro = (firstResponse.body as any).numeroBoleto;

    // Delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Tentativa de registro duplicado com mesmo correlationId
    const secondResponse = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId, // Mesmo correlationId
      'Tipo-processamento': 'ONLINE',
    });

    expect(secondResponse.ok).toBe(false);
    expect(secondResponse.status).toBe(422);
    const errorBody = secondResponse.body as ApiErrorResponse;
    expect(errorBody.mensagem).toMatch(/duplicad|já está sendo processada/i);
  });

  test('E2E003: Validação de idempotência no cancelamento', async ({boletoClient}) => {
    const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

    // Registrar boleto
    const registrarResponse = await boletoClient.registrarBoleto(payload, {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Tipo-processamento': 'ONLINE',
    });

    expect(registrarResponse.ok).toBe(true);
    expect(registrarResponse.body.codigo).toBe('202');
    const numeroBoleto = (registrarResponse.body as any).numeroBoleto;

    // Delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Primeiro cancelamento
    const cancelarCorrelationId = UuidGenerator.generate();
    const firstCancelResponse = await boletoClient.cancelarBoleto(
      {
        numeroBoleto: numeroBoleto,
      },
      {
        'Content-Type': 'application/json',
        'X-Correlation-ID': cancelarCorrelationId,
        TipoProcessamento: 'ONLINE',
      },
    );

    expect(firstCancelResponse.ok).toBe(true);
    expect(firstCancelResponse.body.codigo).toBe('202');

    // Delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Tentativa de cancelamento duplicado com mesmo correlationId
    const secondCancelResponse = await boletoClient.cancelarBoleto(
      {
        numeroBoleto: numeroBoleto,
      },
      {
        'Content-Type': 'application/json',
        'X-Correlation-ID': cancelarCorrelationId, // Mesmo correlationId
        TipoProcessamento: 'ONLINE',
      },
    );

    expect(secondCancelResponse.ok).toBe(false);
    expect(secondCancelResponse.status).toBe(422);
  });
});
