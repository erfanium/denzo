import { Denzo } from "../denzo.ts";
import { assertEquals } from "./deps.ts";
import { createInject } from "../utils/mod.ts";

const { test } = Deno;

test("[integration] hello world", async () => {
  const app = new Denzo();
  app.route<{ Response: unknown }>({
    method: "GET",
    url: "/hi",
    handler() {
      return { hello: "world!" };
    },
  });

  app.finalize();
  const inject = createInject(app);
  const response = await inject("/hi");
  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  const body = await response.json();
  assertEquals(body, { hello: "world!" });
});

test("[integration] Error handler", async () => {
  const app = new Denzo();
  app.route<{ Response: unknown }>({
    method: "GET",
    url: "/hi",
    handler() {
      throw new Error("oh");
    },
  });

  app.finalize();
  const inject = createInject(app);
  const response = await inject("/hi");
  assertEquals(response.status, 500);
  assertEquals(
    response.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  const body = await response.json();
  assertEquals(body, { errorCode: "INTERNAL_SERVER_ERROR", message: "oh" });
});
