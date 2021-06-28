import { findKey, getKey, Key, Meta, setKey } from "./keys.ts";
import { Route } from "./route.ts";

export function paramsToObject(entries: URLSearchParams) {
  const result: Record<string, string> = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}

export interface DefaultRequestTypes {
  Params?: unknown
  Body?: unknown
  Query?: unknown
}
export class ESRequest<T extends DefaultRequestTypes = DefaultRequestTypes> {
  params: T['Params'];
  query: T['Query'];
  body: T['Body'];
  route: Route | undefined;
  raw: Request;
  readonly headers: Headers;
  readonly url: URL;
  readonly path: string;
  readonly method: string;
  meta: Meta = {};

  constructor(rawRequest: Request) {
    this.raw = rawRequest;
    const url = new URL(rawRequest.url);
    this.url = url, this.path = rawRequest.url, this;
    this.method = rawRequest.method, this.params = {};
    this.query = paramsToObject(url.searchParams);
    this.headers = rawRequest.headers, this.body = null;
  }

  set<T>(key: Key<T>, data: T) {
    setKey(this.meta, key, data);
  }

  get<T>(key: Key<T>): T {
    return getKey(this.meta, key);
  }

  find<T>(key: Key<T>): T | undefined {
    return findKey(this.meta, key);
  }
}
