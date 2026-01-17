export function errorAtLine(line: number, message: string): void {
  throw new Error(`Error at line ${line}: ${message}`);
}

export function warnAtLine(line: number, message: string): void {
  console.warn(`Warning at line ${line}: ${message}`);
}
