import { Denzo } from "../denzo.ts";
import { createInject } from "../utils/mod.ts";
import { assertEquals } from "./deps.ts";

const { test } = Deno;

test("[schema] should validate query", async () => {
  const denzo = new Denzo();
  denzo.route({
    method: "GET",
    url: "/",
    schema: {
      query: {
        type: "object",
        properties: {
          foo: { type: "string", pattern: "[0-9]" },
        },
        required: ["foo"],
      },
    },
    handler() {},
  });

  denzo.finalize();
  const inject = createInject(denzo);
  let response = await inject("/");
  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    errorCode: "VALIDATION_ERROR",
    message: "query must have required property 'foo'",
  });

  response = await inject("/?foo=bar");
  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    errorCode: "VALIDATION_ERROR",
    message: 'query /foo must match pattern "[0-9]"',
  });

  response = await inject("/?foo=4");
  assertEquals(response.status, 200);
});

test("[schema] should validate url params", async () => {
  const denzo = new Denzo();
  denzo.route({
    method: "GET",
    url: "/:id",
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string", pattern: "[0-9]" },
        },
        required: ["id"],
      },
    },
    handler() {},
  });

  denzo.finalize();
  const inject = createInject(denzo);

  let response = await inject("/bar");
  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    errorCode: "VALIDATION_ERROR",
    message: 'params /id must match pattern "[0-9]"',
  });

  response = await inject("/4");
  assertEquals(response.status, 200);
});

test("[schema] should validate json body", async () => {
  const denzo = new Denzo();
  denzo.route({
    method: "POST",
    url: "/",
    schema: {
      body: {
        type: "object",
        properties: {
          age: { type: "integer" },
        },
        required: ["age"],
      },
    },
    handler() {},
  });

  denzo.finalize();
  const inject = createInject(denzo);

  let response = await inject("/", { method: "POST" });
  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    errorCode: "VALIDATION_ERROR",
    message: "body must be object",
  });

  response = await inject("/", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ age: 5 }),
  });
  assertEquals(response.status, 200);
});

test("[schema] should validate raw body", async () => {
  const denzo = new Denzo();
  denzo.route({
    method: "POST",
    url: "/",
    schema: {
      body: { type: "string", pattern: "[0-9]" },
    },
    handler() {},
  });

  denzo.finalize();
  const inject = createInject(denzo);

  let response = await inject("/", { method: "POST" });
  assertEquals(response.status, 400);
  assertEquals(await response.json(), {
    errorCode: "VALIDATION_ERROR",
    message: 'body must match pattern "[0-9]"',
  });

  response = await inject("/", {
    method: "POST",
    headers: {
      "content-type": "text/plain",
    },
    body: "7",
  });
  assertEquals(response.status, 200);
});
