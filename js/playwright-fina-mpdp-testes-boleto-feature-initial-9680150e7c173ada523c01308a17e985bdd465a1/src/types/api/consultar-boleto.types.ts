/**
 * Tipos relacionados ao endpoint de Consultar Boleto
 */

export interface ConsultarBoletoQueryParams {
  numeroBoleto: string;
  buscarEventos: boolean;
}

export interface BoletoInfo {
  status: string;
  nossoNumero: string;
  urlPdf: string;
  valor: number;
  valorPago: number;
  dataPagamento: string | null;
  dataVencimento: string; // ISO datetime format
  linhaDigitavel: string;
}

export interface BoletoEvento {
  status: string;
  dataCriacao: string; // ISO datetime format
  mensagemErro: string | null;
}

export interface ConsultarBoletoResponse {
  boleto: BoletoInfo;
  boletoEventos: BoletoEvento[];
}
