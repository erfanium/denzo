import { Ajv } from "../deps.ts";

export interface ValidationError {
  message?: string;
  dataPath: string;
}

export interface ValidatorFunction {
  (params: unknown): ValidationError | null;
}

export interface SchemaCompiler {
  // deno-lint-ignore no-explicit-any
  (schema: any): ValidatorFunction;
}

export function buildAjvSchemaCompiler(): SchemaCompiler {
  const ajv = new Ajv();
  return (schema) => {
    if ("isFluentSchema" in schema) {
      schema = schema.valueOf();
    }

    const check = ajv.compile(schema);
    return (params) => {
      const result = check(params);
      if (result) return null;
      const error = check.errors![0];
      return { dataPath: error.schemaPath, message: error.message };
    };
  };
}
