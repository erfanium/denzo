import { assertEquals, assertThrows } from "./deps.ts";
import { createInject } from "../utils/mod.ts";
import { createPlugin } from "../lib/plugin.ts";
import { createKey } from "../lib/keys.ts";
import { Denzo } from "../denzo.ts";

const { test } = Deno;

test("[keys] should return correct value of key", async () => {
  const app = new Denzo();
  const framework = createKey("framework");

  app.addHook(
    "onRequest",
    (request) => {
      request.set(framework, (request.query as any).framework);
    },
  );

  app.route({
    method: "GET",
    url: "/search",
    handler(request) {
      assertEquals(request.get(framework), "denzo");
    },
  });
  app.finalize();

  const inject = createInject(app);
  await inject("/search?framework=denzo");
});

test("[keys] should return correct value of key when key attached to nested plugin", async () => {
  const app = new Denzo();
  const scope = createKey("scope");

  app.addHook(
    "onRequest",
    (request) => {
      request.set(scope, (request.query as any).scope);
    },
  );

  app.route({
    method: "GET",
    url: "/search",
    handler(request) {
      assertEquals(request.get(scope), "root");
    },
  });

  const plugin = createPlugin("plugin", (denzo) => {
    denzo.route({
      method: "GET",
      url: "/search",
      handler(request) {
        assertEquals(request.get(scope), "plugin");
      },
    });
    denzo.addHook(
      "onRequest",
      (request) => {
        request.set(scope, (request.query as any).scope);
      },
    );
  });

  app.register(plugin, { prefix: "/plugin" });
  app.finalize();

  const inject = createInject(app);
  await inject("/search?scope=root");
  await inject("/plugin/search?scope=plugin");
});

test("[keys] should distinguish each created key as unique", async () => {
  const app = new Denzo();
  app.addHook(
    "onRequest",
    (request) => {
      request.set(createKey("framework"), (request.query as any).framework);
    },
  );

  app.route({
    method: "GET",
    url: "/search",
    handler(request) {
      assertThrows(() => request.get(createKey("framework")));
    },
  });
  app.finalize();

  const inject = createInject(app);
  await inject("/search?framework=denzo");
});
