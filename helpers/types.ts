/** Type predicate. Checks if the given value is a `Record<string, unknown>`. */
export function isRecord<R extends Record<string, unknown>>(value: unknown): value is R {
  return value !== null && typeof value === 'object';
}
