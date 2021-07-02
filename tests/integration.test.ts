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
  assertEquals(response.headers.get("content-type"), "application/json");
  const body = await response.json();
  assertEquals(body, { hello: "world!" });
});
