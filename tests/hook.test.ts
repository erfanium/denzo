import { assertEquals } from "./deps.ts";
import { createInject } from "../utils/mod.ts";
import { Denzo } from "../denzo.ts";
import { createPlugin } from "../mod.ts";

const { test } = Deno;

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

test("[hook] hook execution order", async () => {
  const app = new Denzo();
  const order: string[] = [];
  const errors: string[] = [];

  app.addHook("onRequest", () => {
    order.push("onRequest");
  });

  app.addHook("preValidation", () => {
    order.push("preValidation");
  });

  app.addHook("preHandler", () => {
    order.push("preHandler");
  });

  app.addHook("preSerialization", () => {
    order.push("preSerialization");
  });

  app.addHook("onError", () => {
    errors.push("error");
  });

  app.route({ method: "GET", url: "/", handler() {} });
  app.finalize();

  const inject = createInject(app);
  const response = await inject("/");
  assertEquals(response.status, 200);
  assertEquals(order, [
    "onRequest",
    "preValidation",
    "preHandler",
    "preSerialization",
  ]);
  assertEquals(errors, []);
});

test("[hook] 404 hook execution order", async () => {
  const app = new Denzo();
  const order: string[] = [];
  const errors: string[] = [];

  app.addHook("onRequest", () => {
    order.push("onRequest");
  });

  app.addHook("preValidation", () => {
    order.push("preValidation");
  });

  app.addHook("preHandler", () => {
    order.push("preHandler");
  });

  app.addHook("preSerialization", () => {
    order.push("preSerialization");
  });

  app.addHook("onError", () => {
    errors.push("error");
  });

  app.finalize();
  const inject = createInject(app);
  const response = await inject("/");
  assertEquals(response.status, 404);
  assertEquals(order, [
    "onRequest",
    "preHandler",
    "preSerialization",
  ]);
  assertEquals(errors, []);
});

test("[hook] async hook execution order", async () => {
  const app = new Denzo();
  const order: string[] = [];
  const errors: string[] = [];

  app.addHook("onRequest", async () => {
    order.push("onRequest-start");
    await delay(100);
    order.push("onRequest-end");
  });

  app.addHook("onRequest", async () => {
    order.push("onRequest2-start");
    await delay(100);
    order.push("onRequest2-end");
  });

  app.addHook("preValidation", () => {
    order.push("preValidation");
  });

  app.addHook("onError", () => {
    errors.push("error");
  });

  app.route({ method: "GET", url: "/", handler() {} });
  app.finalize();

  const inject = createInject(app);
  const response = await inject("/");
  assertEquals(response.status, 200);
  assertEquals(order, [
    "onRequest-start",
    "onRequest-end",
    "onRequest2-start",
    "onRequest2-end",
    "preValidation",
  ]);
  assertEquals(errors, []);
});

test("[hook] plugin encapsulation", async () => {
  const root = new Denzo();
  let order: string[] = [];

  root.addHook("onRequest", () => {
    order.push("root-onRequest");
  });

  const level1 = createPlugin("l1", (denzo) => {
    denzo.addHook("onRequest", () => {
      order.push("plugin-onRequest");
    });

    denzo.register(level2);

    denzo.route({
      method: "GET",
      url: "/plugin",
      handler() {
        return { from: "plugin" };
      },
    });
  });

  const level2 = createPlugin("l2", (denzo) => {
    denzo.addHook("onRequest", () => {
      order.push("plugin2-onRequest");
    });

    denzo.route({
      method: "GET",
      url: "/plugin2",
      handler() {
        return { from: "plugin2" };
      },
    });
  });

  root.register(level1);

  root.route({
    method: "GET",
    url: "/root",
    handler() {
      return { from: "root" };
    },
  });

  root.finalize();
  const inject = createInject(root);

  const response = await inject("/root");
  assertEquals(response.status, 200);
  assertEquals(order, ["root-onRequest"]);
  assertEquals(await response.json(), { from: "root" });

  order = []; // reset order array;

  const response2 = await inject("/plugin");
  assertEquals(response2.status, 200);
  assertEquals(order, ["root-onRequest", "plugin-onRequest"]);
  assertEquals(await response2.json(), { from: "plugin" });

  order = []; // reset order array;

  const response3 = await inject("/plugin2");
  assertEquals(response3.status, 200);
  assertEquals(order, [
    "root-onRequest",
    "plugin-onRequest",
    "plugin2-onRequest",
  ]);
  assertEquals(await response3.json(), { from: "plugin2" });
});

test("[hook] plugin root-level hooks", async () => {
  const order: string[] = [];
  const app = new Denzo();

  const plugin = createPlugin("plugin", (denzo) => {
    denzo.addHook("onRequest", () => {
      order.push("root-onRequest");
    }, { scope: "root" });

    denzo.addHook("onRequest", () => {
      order.push("plugin-onRequest");
    });
  });

  app.register(plugin, { allowRootHooks: true });
  app.route({ method: "GET", url: "/", handler() {} });
  app.finalize();
  const inject = createInject(app);
  const response = await inject("/");
  assertEquals(response.status, 200);
  assertEquals(order, ["root-onRequest"]);
});
