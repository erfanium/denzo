import {
  defaultParsers,
  findContentParser,
} from "../lib/contentTypeParsers.ts";
import { assert } from "./deps.ts";

const { test } = Deno;

test("[content parser] should find string-based parser", () => {
  assert(findContentParser(defaultParsers, "application/json"));
  assert(findContentParser(defaultParsers, "application/json; charset=UTF-8"));
});
