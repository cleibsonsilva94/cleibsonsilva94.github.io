import {HttpResponse} from '../types/common/response.types';

/**
 * Falha o teste com mensagem clara quando a API retorna erro (status 4xx/5xx).
 * Use antes dos expects para ver status e body da API quando algo der errado.
 */
export function assertApiSuccess(
  response: HttpResponse<unknown>,
  context: string,
): asserts response is HttpResponse<unknown> & {ok: true} {
  if (!response.ok) {
    const bodyStr = typeof response.body === 'object' ? JSON.stringify(response.body, null, 2) : String(response.body);
    const urlLine = response.requestUrl ? `\nURL chamada: ${response.requestUrl}` : '';
    const hint404 =
      response.status === 404
        ? '\n\n404 = Not Found. A URL acima não existe no servidor. Verifique: (1) BASE_URL está correto? (2) O contexto da API (ex.: /sboot-fina-mpdp-boleto-orchestrator) está incluso na BASE_URL? (3) O serviço está no ar nessa base?'
        : '';
    throw new Error(
      `${context}\n` +
        `Esperado: response.ok === true (status 2xx).\n` +
        `Recebido: status ${response.status}, response.ok === false.${urlLine}` +
        `\nBody da API:\n${bodyStr}` +
        hint404,
    );
  }
}
