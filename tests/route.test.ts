import { allHTTPMethods } from "../lib/httpMethods.ts";
import { Route } from "../lib/route.ts";
import { assertEquals } from "./deps.ts";

const { test } = Deno;

test("[route] '*' wildcard method", () => {
  const route = new Route({
    method: "*",
    url: "/a",
    handler() {},
  });

  assertEquals(route.methods, allHTTPMethods);
});

test("[route] '*' wildcard url", () => {
  const route = new Route({
    method: "POST",
    url: "*",
    handler() {},
  });

  assertEquals(route.urls, ["/*"]);
});
