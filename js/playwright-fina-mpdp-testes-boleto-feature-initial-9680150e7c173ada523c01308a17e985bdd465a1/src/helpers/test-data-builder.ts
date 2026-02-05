/**
 * Builder para construção de dados de teste
 */

import { BoletoCompleto, Pagador, Boleto, Endereco } from '../types/domain/boleto.types';
import { generateIdExterno, generateCpf } from './boleto-faker';

export class TestDataBuilder {
  /**
   * Cria um endereço padrão para testes
   */
  static createEndereco(overrides?: Partial<Endereco>): Endereco {
    return {
      logradouro: 'R. Guaianases, 1238',
      bairro: 'Campos Elíseos',
      cidade: 'São Paulo',
      numero: '102',
      uf: 'SP',
      cep: '01204-002',
      ...overrides,
    };
  }

  /**
   * Cria um pagador padrão para testes
   */
  static createPagador(overrides?: Partial<Pagador>): Pagador {
    return {      
      tipoDocumento: 'CPF',
      numeroDocumento: '51099188806',
      nome: 'João Silva',
      endereco: this.createEndereco(),
      ...overrides,
    };
  }

  /**
   * Cria um pagador com CPF válido
   */
  static createPagadorCPF(overrides?: Partial<Pagador>): Pagador {
    return this.createPagador({
      tipoDocumento: 'CPF',
      numeroDocumento: '51099188806',
      ...overrides,
    });
  }

  /**
   * Cria um pagador com CNPJ válido
   */
  static createPagadorCNPJ(overrides?: Partial<Pagador>): Pagador {
    return this.createPagador({
      tipoDocumento: 'CNPJ',
      numeroDocumento: '12345678000195',
      nome: 'Empresa LTDA',
      ...overrides,
    });
  }

  /**
   * Cria um boleto padrão para testes
   */
  static createBoleto(overrides?: Partial<Boleto>): Boleto {
    const dataVencimento = new Date();
    dataVencimento.setMonth(dataVencimento.getMonth() + 2);
    
    return {
      valor: 1585.3,
      dataVencimento: dataVencimento.toISOString().split('T')[0], // YYYY-MM-DD
      ...overrides,
    };
  }

  /**
   * Cria um boleto com valor alto
   */
  static createBoletoValorAlto(overrides?: Partial<Boleto>): Boleto {
    return this.createBoleto({
      valor: 999999.99,
      dataVencimento: '2026-12-31',      
      ...overrides,
    });
  }

  /**
   * Cria um boleto com valor negativo
   */
  static createBoletoValorNegativo(overrides?: Partial<Boleto>): Boleto {
    return this.createBoleto({
      valor: -100,      
      ...overrides,
    });
  }

  /**
   * Cria um boleto com data no passado
   */
  static createBoletoDataPassado(overrides?: Partial<Boleto>): Boleto {
    return this.createBoleto({
      valor: 100,
      dataVencimento: '2020-01-01',      
      ...overrides,
    });
  }

  /**
   * Cria um payload completo de registro de boleto (valores fixos).
   * Use createRegistrarBoletoPayloadUnico() quando cada registro precisar ser único.
   */
  static createRegistrarBoletoPayload(overrides?: Partial<BoletoCompleto>): BoletoCompleto {
    return {
      idExterno: 'PPOOAC2',
      codProduto: '1',
      pagador: this.createPagador(),      
      boleto: this.createBoleto(),
      ...overrides,
    };
  }

  /**
   * Cria um payload de registro com idExterno e numeroDocumento (CPF) únicos.
   * Use em todo registro novo de boleto para evitar conflito de numeroBoleto
   * (numeroBoleto é determinado por idExterno, pagador, valor, etc.).
   */
  static createRegistrarBoletoPayloadUnico(overrides?: Partial<BoletoCompleto>): BoletoCompleto {
    return this.createRegistrarBoletoPayload({
      idExterno: generateIdExterno(),
      pagador: this.createPagador({ numeroDocumento: generateCpf() }),
      ...overrides,
    });
  }

  /**
   * Cria um payload sem idExterno (para testes de validação)
   */
  static createRegistrarBoletoPayloadSemIdExterno(): Omit<BoletoCompleto, 'idExterno'> {
    const { idExterno, ...payload } = this.createRegistrarBoletoPayload();
    return payload;
  }

  /**
   * Cria um payload sem codProduto (para testes de validação)
   */
  static createRegistrarBoletoPayloadSemCodProduto(): Omit<BoletoCompleto, 'codProduto'> {
    const { codProduto, ...payload } = this.createRegistrarBoletoPayload();
    return payload;
  }

  /**
   * Cria um payload sem pagador (para testes de validação)
   */
  static createRegistrarBoletoPayloadSemPagador(): Omit<BoletoCompleto, 'pagador'> {
    const { pagador, ...payload } = this.createRegistrarBoletoPayload();
    return payload;
  }

  /**
   * Cria um payload sem boleto (para testes de validação)
   */
  static createRegistrarBoletoPayloadSemBoleto(): Omit<BoletoCompleto, 'boleto'> {
    const { boleto, ...payload } = this.createRegistrarBoletoPayload();
    return payload;
  }
}
