import { createPlugin, Denzo } from "../mod.ts";
import { assert, assertEquals, assertThrows } from "./deps.ts";

const { test } = Deno;
test("[permissions] app should grant parentHooks permissions ", () => {
  const app = new Denzo();

  const plugin = createPlugin("plugin", (denzo) => {
    denzo.addHook("onRequest", () => {}, { scope: "parent" });
  });

  app.register(plugin, { allowParentHooks: true });
  app.finalize();
});

test("[permissions] app should not grant parentHooks permissions ", () => {
  const app = new Denzo();

  const plugin = createPlugin("plugin", (denzo) => {
    denzo.addHook("onRequest", () => {}, { scope: "parent" });
  });

  assertThrows(() => app.register(plugin), Error);
});

test("[permissions] plugin1 should grant parentHooks access to plugin2", () => {
  const app = new Denzo();

  const plugin1 = createPlugin("plugin1", (denzo) => {
    denzo.register(plugin2, { allowParentHooks: true });
  });

  const plugin2 = createPlugin("plugin2", (denzo) => {
    denzo.addHook("onRequest", () => {}, { scope: "parent" });
  });

  app.register(plugin1, { allowParentHooks: true });
});

test("[permissions] plugin1 should grant parentHooks access to plugin2", () => {
  const app = new Denzo();

  const plugin1 = createPlugin("plugin1", (denzo) => {
    denzo.register(plugin2, { allowParentHooks: true });
  });

  const plugin2 = createPlugin("plugin2", (denzo) => {
    denzo.addHook("onRequest", () => {}, { scope: "parent" });
  });

  app.register(plugin1);
});

test("[permissions] plugin2 should not have access to root scope", () => {
  const app = new Denzo();

  const plugin1 = createPlugin("plugin1", (denzo) => {
    denzo.register(plugin2, { allowParentHooks: true });
  });

  const plugin2 = createPlugin("plugin2", (denzo) => {
    denzo.addHook("onRequest", () => {}, { scope: "parent" });
  });

  app.register(plugin1);

  app.finalize();
  assertEquals(app.hooks, {});
});
