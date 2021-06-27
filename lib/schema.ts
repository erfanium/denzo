import { Ajv } from "../deps.ts";

export interface ValidationError {
  message?: string;
  dataPath: string;
}

export interface ValidatorFunction {
  (params: unknown): ValidationError | null;
}

export interface SchemaCompiler {
  (schema: unknown): ValidatorFunction;
}

export function buildAjvSchemaCompiler(): SchemaCompiler {
  const ajv = new Ajv();
  return (schema) => {
    // deno-lint-ignore no-explicit-any
    const check = ajv.compile(schema as any);
    return (params) => {
      const result = check(params);
      if (result) return null;
      const error = check.errors![0];
      return { dataPath: error.schemaPath, message: error.message };
    };
  };
}
