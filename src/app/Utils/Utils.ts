export function isEmptyCode(code: string | null | undefined): boolean {
  return !code || code.trim().length === 0 || code === '00000000-0000-0000-0000-000000000000';
}
