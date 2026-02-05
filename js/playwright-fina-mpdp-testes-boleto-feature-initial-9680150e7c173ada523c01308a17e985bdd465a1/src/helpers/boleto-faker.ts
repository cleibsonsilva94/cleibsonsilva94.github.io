/**
 * Faker para dados únicos de boleto (idExterno e numeroDocumento/CPF).
 * Garante que cada registro tenha idExterno e CPF únicos para evitar conflito de numeroBoleto.
 */

/**
 * Gera um idExterno único (alfanumérico).
 * Formato: prefixo + timestamp + random para garantir unicidade.
 */
export function generateIdExterno(): string {
  const prefix = 'EXT';
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${timePart}-${randomPart}`;
}

/**
 * Calcula o dígito verificador do CPF (algoritmo mod 11).
 * @param digits - 9 ou 10 dígitos (string ou array de números)
 * @param weights - pesos para o cálculo (10,9,8... ou 11,10,9...)
 */
function cpfCheckDigit(digits: number[], weights: number[]): number {
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Gera um CPF válido (11 dígitos) com dígitos verificadores corretos.
 * Cada chamada produz um número diferente para evitar duplicidade.
 */
export function generateCpf(): string {
  const nine: number[] = [];
  for (let i = 0; i < 9; i++) {
    nine.push(Math.floor(Math.random() * 10));
  }
  const first = cpfCheckDigit(nine, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = cpfCheckDigit([...nine, first], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return [...nine, first, second].join('');
}
