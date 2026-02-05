/**
 * Tipos relacionados aos headers HTTP da API
 */

export type TipoProcessamento = 'ONLINE' | 'BATCH';

export interface ApiHeaders {
  'Content-Type': 'application/json';
  'X-Correlation-ID': string;
  'Tipo-processamento'?: TipoProcessamento;
  'TipoProcessamento'?: TipoProcessamento; // Para endpoint de cancelar
}

export interface RegistrarBoletoHeaders extends ApiHeaders {
  'Tipo-processamento': TipoProcessamento;
}

export interface ConsultarBoletoHeaders extends ApiHeaders {
  'Tipo-processamento'?: never;
  'TipoProcessamento'?: never;
}

export interface CancelarBoletoHeaders extends ApiHeaders {
  'Tipo-processamento'?: never;
  'TipoProcessamento': TipoProcessamento;
}
