/**
 * Tipos relacionados ao endpoint de Registrar Boleto
 */

import { BoletoCompleto } from '../domain/boleto.types';
import { ApiSuccessResponse } from '../common/response.types';

export interface RegistrarBoletoRequest extends BoletoCompleto {}

export interface RegistrarBoletoResponse extends ApiSuccessResponse {
  numeroBoleto: string;
}

export interface RegistrarBoletoErrorResponse {
  codigo?: string;
  mensagem: string;
  correlationId?: string;
}
