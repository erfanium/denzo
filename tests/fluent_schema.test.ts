import { Denzo } from "../denzo.ts";
import { createInject } from "../utils/mod.ts";
import { assertEquals, FluentSchema } from "./deps.ts";

const { test } = Deno;

test("[fluent-schema] should validate json body", async () => {
  const denzo = new Denzo();
  denzo.route({
    method: "POST",
    url: "/",
    schema: {
      body: FluentSchema.object().prop(
        "age",
        FluentSchema.integer().required(),
      ),
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
