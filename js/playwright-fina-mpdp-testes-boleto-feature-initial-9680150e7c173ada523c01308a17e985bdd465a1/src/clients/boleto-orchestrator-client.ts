/**
 * Cliente HTTP para o Orquestrador de Boletos
 */

import {APIRequestContext} from '@playwright/test';
import {RegistrarBoletoRequest, RegistrarBoletoResponse} from '../types/api/registrar-boleto.types';
import {ConsultarBoletoQueryParams, ConsultarBoletoResponse} from '../types/api/consultar-boleto.types';
import {CancelarBoletoRequest, CancelarBoletoResponse} from '../types/api/cancelar-boleto.types';
import {RegistrarBoletoHeaders, ConsultarBoletoHeaders, CancelarBoletoHeaders} from '../types/common/headers.types';
import {HttpResponse, ApiErrorResponse} from '../types/common/response.types';

export interface IBoletoOrchestratorClient {
  registrarBoleto(
    payload: RegistrarBoletoRequest,
    headers: RegistrarBoletoHeaders,
  ): Promise<HttpResponse<RegistrarBoletoResponse | ApiErrorResponse>>;

  consultarBoleto(
    params: ConsultarBoletoQueryParams,
    headers: ConsultarBoletoHeaders,
  ): Promise<HttpResponse<ConsultarBoletoResponse | ApiErrorResponse>>;

  cancelarBoleto(
    payload: CancelarBoletoRequest,
    headers: CancelarBoletoHeaders,
  ): Promise<HttpResponse<CancelarBoletoResponse | ApiErrorResponse>>;
}

export class BoletoOrchestratorClient implements IBoletoOrchestratorClient {
  constructor(private readonly request: APIRequestContext, private readonly baseURL: string) {}

  async registrarBoleto(
    payload: RegistrarBoletoRequest,
    headers: RegistrarBoletoHeaders,
  ): Promise<HttpResponse<RegistrarBoletoResponse | ApiErrorResponse>> {
    const requestUrl = `${this.baseURL}/api/boletos`;
    const response = await this.request.post(requestUrl, {
      headers: headers as unknown as Record<string, string>,
      data: payload,
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    return {
      status,
      ok: response.ok(),
      body: body as RegistrarBoletoResponse | ApiErrorResponse,
      requestUrl,
    };
  }

  async consultarBoleto(
    params: ConsultarBoletoQueryParams,
    headers: ConsultarBoletoHeaders,
  ): Promise<HttpResponse<ConsultarBoletoResponse | ApiErrorResponse>> {
    const queryString = new URLSearchParams({
      numeroBoleto: params.numeroBoleto,
      buscarEventos: params.buscarEventos.toString(),
    }).toString();

    const requestUrl = `${this.baseURL}/api/boleto?${queryString}`;
    const response = await this.request.get(requestUrl, {
      headers: headers as unknown as Record<string, string>,
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    return {
      status,
      ok: response.ok(),
      body: body as ConsultarBoletoResponse | ApiErrorResponse,
      requestUrl,
    };
  }

  async cancelarBoleto(
    payload: CancelarBoletoRequest,
    headers: CancelarBoletoHeaders,
  ): Promise<HttpResponse<CancelarBoletoResponse | ApiErrorResponse>> {
    const requestUrl = `${this.baseURL}/api/boletos/cancelar`;
    const response = await this.request.delete(requestUrl, {
      headers: headers as unknown as Record<string, string>,
      data: payload,
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    return {
      status,
      ok: response.ok(),
      body: body as CancelarBoletoResponse | ApiErrorResponse,
      requestUrl,
    };
  }
}
