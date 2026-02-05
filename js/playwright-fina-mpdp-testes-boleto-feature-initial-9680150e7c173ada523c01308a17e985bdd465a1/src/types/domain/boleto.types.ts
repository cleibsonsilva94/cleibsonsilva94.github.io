/**
 * Tipos de domínio relacionados a Boletos
 */

export type TipoDocumento = 'CPF' | 'CNPJ';

export interface Endereco {
  logradouro: string;
  bairro: string;
  cidade: string;
  numero: string;
  uf: string;
  cep: string;
}

export interface Pagador {  
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nome: string;
  endereco: Endereco;
}

export interface Boleto {
  valor: number;
  dataVencimento: string;  
}

export interface BoletoCompleto {
  idExterno: string;
  codProduto: string;
  pagador: Pagador;  
  boleto: Boleto;
}
