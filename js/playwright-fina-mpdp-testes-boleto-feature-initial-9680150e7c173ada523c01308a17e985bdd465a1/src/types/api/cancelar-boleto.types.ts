/**
 * Tipos relacionados ao endpoint de Cancelar Boleto
 */

import { ApiSuccessResponse } from '../common/response.types';

export interface CancelarBoletoRequest {
  numeroBoleto: string;
}

export interface CancelarBoletoResponse extends ApiSuccessResponse {}

export interface CancelarBoletoErrorResponse {
  codigo?: string;
  mensagem: string;
  correlationId?: string;
}
