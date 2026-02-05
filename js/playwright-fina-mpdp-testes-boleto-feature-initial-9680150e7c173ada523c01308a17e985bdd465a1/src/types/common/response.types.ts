/**
 * Tipos relacionados às respostas da API
 */

export interface ApiSuccessResponse {
  codigo: string;
  mensagem: string;
  correlationId: string;
}

export interface ApiErrorResponse {
  codigo?: string;
  mensagem: string;
  correlationId?: string;
  errors?: Array<{
    campo?: string;
    mensagem: string;
  }>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse & T;

/**
 * Resposta HTTP padronizada que sempre retorna status e body
 * Não lança exceções, facilitando o tratamento nos testes
 */
export interface HttpResponse<T = unknown> {
  status: number;
  ok: boolean;
  body: T;
  /** URL efetiva da requisição (para debug, ex.: 404 por BASE_URL/context path errado) */
  requestUrl?: string;
}
