import { defaultParsers, findContentParser } from "../lib/content_parser.ts";
import { assert } from "./deps.ts";

const { test } = Deno;

test("[content parser] should find string-based parser", () => {
  assert(findContentParser(defaultParsers, "application/json"));
  assert(findContentParser(defaultParsers, "application/json; charset=UTF-8"));
  assert(findContentParser(defaultParsers, "text/plain"));
  assert(findContentParser(defaultParsers, "text/plain; charset=UTF-8"));
});
