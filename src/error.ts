import type { DataFile } from "./data_file.ts";

function prettyFileName(dataFile: DataFile): string {
  return `${dataFile.dataSource?.name ?? ""}/${dataFile.path}`;
}

export function errorAtLine(line: number, message: string): void {
  throw new Error(`Error at line ${line}: ${message}`);
}

export function warnAtLine(line: number, message: string): void {
  console.warn(`Warning at line ${line}: ${message}`);
}

export function errorAtDataFileLine(
  dataFile: DataFile,
  line: number,
  message: string,
): void {
  throw new Error(
    `Error at file ${prettyFileName(dataFile)}, line ${line}: ${message}`,
  );
}

export function warnAtDataFileLine(
  dataFile: DataFile,
  line: number,
  message: string,
): void {
  console.warn(
    `Warning at file ${prettyFileName(dataFile)}, line ${line}: ${message}`,
  );
}
