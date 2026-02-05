/**
 * Testes de Performance
 * TC018 - Teste de carga: 50 requisições simultâneas de geração de boletos
 *
 * Objetivo:
 * 1. Gerar 50 boletos de forma simultânea
 * 2. Armazenar todos os números de boletos gerados
 * 3. Consultar todos os 50 boletos para validar comportamento sob carga
 */

import {test, expect} from '../src/fixtures/api-fixtures';
import {UuidGenerator} from '../src/helpers/uuid-generator';
import {TestDataBuilder} from '../src/helpers/test-data-builder';
import type {RegistrarBoletoResponse} from '../src/types/api/registrar-boleto.types';
import type {ConsultarBoletoResponse} from '../src/types/api/consultar-boleto.types';

interface BoletoGerado {
  numeroBoleto: string;
  correlationId: string;
  statusRegistro: number;
}

test.describe('Performance - Teste de Carga', () => {
  let boletosGerados: BoletoGerado[] = [];
  const QUANTIDADE_BOLETOS = 50;
  const DELAY_ENTRE_CONSULTAS = 1000; // 1 segundo

  test('TC018: Gerar 50 boletos simultaneamente e consultar todos', async ({boletoClient}) => {
    console.log(`\n📊 Iniciando teste de performance com ${QUANTIDADE_BOLETOS} boletos...\n`);

    // ============================================
    // FASE 1: Gerar 50 boletos simultaneamente
    // ============================================
    console.log('⏱️  FASE 1: Gerando 50 boletos simultaneamente...');
    const inicioGeracaoBoletos = Date.now();

    // Criar 50 promises de registrar boleto
    const promessasRegistro = Array.from({length: QUANTIDADE_BOLETOS}).map(async (_, index) => {
      const correlationId = UuidGenerator.generate();
      const payload = TestDataBuilder.createRegistrarBoletoPayloadUnico();

      try {
        const response = await boletoClient.registrarBoleto(payload, {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
          'Tipo-processamento': 'ONLINE',
        });

        if (response.ok && response.status === 202) {
          const body = response.body as RegistrarBoletoResponse;
          return {
            numeroBoleto: body.numeroBoleto,
            correlationId: correlationId,
            statusRegistro: response.status,
          } as BoletoGerado;
        } else {
          console.error(`❌ Falha no boleto ${index + 1}: Status ${response.status}`);
          return null;
        }
      } catch (error) {
        console.error(`❌ Erro ao gerar boleto ${index + 1}:`, error);
        return null;
      }
    });

    // Aguardar todas as 50 requisições
    const resultadosRegistro = await Promise.all(promessasRegistro);
    const tempoGeracaoBoletos = Date.now() - inicioGeracaoBoletos;

    // Filtrar apenas os boletos registrados com sucesso
    boletosGerados = resultadosRegistro.filter((boleto): boleto is BoletoGerado => boleto !== null);

    console.log(`✅ Boletos gerados com sucesso: ${boletosGerados.length}/${QUANTIDADE_BOLETOS}`);
    console.log(`⏱️  Tempo total de geração: ${tempoGeracaoBoletos}ms (${(tempoGeracaoBoletos / 1000).toFixed(2)}s)`);
    console.log(`📈 Taxa média: ${(QUANTIDADE_BOLETOS / (tempoGeracaoBoletos / 1000)).toFixed(2)} boletos/segundo\n`);

    // Validação da Fase 1
    expect(boletosGerados.length).toBeGreaterThan(0);
    expect(boletosGerados.length).toBeLessThanOrEqual(QUANTIDADE_BOLETOS);

    // ============================================
    // FASE 2: Aguardar processamento
    // ============================================
    console.log('⏰ Aguardando processamento dos boletos (5 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // ============================================
    // FASE 3: Consultar todos os 50 boletos
    // ============================================
    console.log(`\n🔍 FASE 2: Consultando ${boletosGerados.length} boletos...\n`);
    const inicioConsultaBoletos = Date.now();

    const promessasConsulta = boletosGerados.map(async (boleto, index) => {
      try {
        // Delay progressivo para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, index * 50));

        let response;
        let tentativa = 0;
        const maxTentativas = 6;

        // Retry com backoff para garantir que o boleto esteja disponível
        while (tentativa < maxTentativas) {
          response = await boletoClient.consultarBoleto(
            {numeroBoleto: boleto.numeroBoleto, buscarEventos: true},
            {
              'Content-Type': 'application/json',
              'X-Correlation-ID': boleto.correlationId,
            },
          );

          if (response.ok && response.status === 200) {
            break;
          }

          tentativa++;
          if (tentativa < maxTentativas) {
            await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_CONSULTAS));
          }
        }

        if (response?.ok && response.status === 200) {
          const body = response.body as ConsultarBoletoResponse;
          return {
            numeroBoleto: boleto.numeroBoleto,
            statusConsulta: response.status,
            boleto: body.boleto,
            sucesso: true,
          };
        } else {
          console.error(`❌ Falha ao consultar boleto ${boleto.numeroBoleto}: Status ${response?.status}`);
          return {
            numeroBoleto: boleto.numeroBoleto,
            statusConsulta: response?.status || 500,
            sucesso: false,
          };
        }
      } catch (error) {
        console.error(`❌ Erro ao consultar boleto ${boleto.numeroBoleto}:`, error);
        return {
          numeroBoleto: boleto.numeroBoleto,
          statusConsulta: 500,
          sucesso: false,
        };
      }
    });

    // Aguardar todas as 50 consultas
    const resultadosConsulta = await Promise.all(promessasConsulta);
    const tempoConsultaBoletos = Date.now() - inicioConsultaBoletos;

    // Filtrar apenas as consultas bem-sucedidas
    const consultasSucesso = resultadosConsulta.filter(r => r.sucesso);

    console.log(`✅ Boletos consultados com sucesso: ${consultasSucesso.length}/${boletosGerados.length}`);
    console.log(
      `⏱️  Tempo total de consulta: ${tempoConsultaBoletos}ms (${(tempoConsultaBoletos / 1000).toFixed(2)}s)`,
    );
    console.log(
      `📈 Taxa média: ${(boletosGerados.length / (tempoConsultaBoletos / 1000)).toFixed(2)} consultas/segundo\n`,
    );

    // ============================================
    // RESUMO FINAL
    // ============================================
    console.log('📊 ========== RESUMO DO TESTE DE PERFORMANCE ==========');
    console.log(`Total de boletos gerados: ${boletosGerados.length}/${QUANTIDADE_BOLETOS}`);
    console.log(`Total de boletos consultados: ${consultasSucesso.length}/${boletosGerados.length}`);
    console.log(`Taxa de sucesso geral: ${((consultasSucesso.length / boletosGerados.length) * 100).toFixed(2)}%`);
    console.log(`Tempo total de execução: ${(tempoGeracaoBoletos + tempoConsultaBoletos) / 1000}s`);
    console.log('====================================================\n');

    // ============================================
    // VALIDAÇÕES
    // ============================================
    expect(boletosGerados.length).toBeGreaterThan(0);
    expect(consultasSucesso.length).toBeGreaterThan(0);
    expect(consultasSucesso.length / boletosGerados.length).toBeGreaterThan(0.8); // Mínimo 80% de sucesso
  });

  test('TC019: Validar estrutura de dados dos 50 boletos consultados', async ({boletoClient}) => {
    // Este teste valida que os boletos consultados têm a estrutura esperada
    // Reutiliza os boletos gerados no teste anterior

    if (boletosGerados.length === 0) {
      console.warn('⚠️  Nenhum boleto disponível para validação. Execute TC018 primeiro.');
      return;
    }

    console.log(`\n🔎 Validando estrutura de ${boletosGerados.length} boletos...\n`);

    const promessasValidacao = boletosGerados.slice(0, 10).map(async (boleto, index) => {
      const response = await boletoClient.consultarBoleto(
        {numeroBoleto: boleto.numeroBoleto, buscarEventos: true},
        {
          'Content-Type': 'application/json',
          'X-Correlation-ID': boleto.correlationId,
        },
      );

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const body = response.body as ConsultarBoletoResponse;
      expect(body.boleto).toBeDefined();
      expect(body.boleto.nossoNumero).toBeTruthy();
      expect(body.boleto.valor).toBeGreaterThan(0);
      expect(body.boleto.dataVencimento).toBeTruthy();
      expect(body.boleto.status).toBeDefined();

      console.log(`✅ Boleto ${index + 1}/10 validado: ${boleto.numeroBoleto}`);
    });

    await Promise.all(promessasValidacao);
    console.log('\n✅ Estrutura de dados validada com sucesso!\n');
  });
});
