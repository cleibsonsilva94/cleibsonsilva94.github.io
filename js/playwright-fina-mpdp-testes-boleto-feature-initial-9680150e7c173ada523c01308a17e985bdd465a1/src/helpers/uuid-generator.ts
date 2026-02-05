/**
 * Utilitário para geração de UUIDs
 */

export class UuidGenerator {
  /**
   * Gera um UUID v4 único
   */
  static generate(): string {
    return crypto.randomUUID();
  }

  /**
   * Gera múltiplos UUIDs
   */
  static generateMultiple(count: number): string[] {
    return Array.from({ length: count }, () => this.generate());
  }
}
