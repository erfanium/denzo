import { createPlugin, Denzo } from "../mod.ts";
import { assertThrows } from "./deps.ts";

const { test } = Deno;
test("[permissions] app should grant rootHooks permissions ", () => {
  const app = new Denzo();

  const plugin = createPlugin("plugin", (denzo) => {
    denzo.addHook("onRequest", () => {}, { scope: "root" });
  });

  app.register(plugin, { allowRootHooks: true });
  app.finalize();
});

test("[permissions] app should not grant rootHooks permissions ", () => {
  const app = new Denzo();

  const plugin = createPlugin("plugin", (denzo) => {
    denzo.addHook("onRequest", () => {}, { scope: "root" });
  });

  assertThrows(() => app.register(plugin), Error);
});

test("[permissions] plugin should grant rootHooks to other plugin", () => {
  const app = new Denzo();

  const plugin1 = createPlugin("plugin1", (denzo) => {
    denzo.register(plugin2, { allowRootHooks: true });
  });

  const plugin2 = createPlugin("plugin2", (denzo) => {
    denzo.addHook("onRequest", () => {}, { scope: "root" });
  });

  app.register(plugin1, { allowRootHooks: true });
});

test("[permissions] plugin should not grant rootHooks to other plugin", () => {
  const app = new Denzo();

  const plugin1 = createPlugin("plugin1", (denzo) => {
    denzo.register(plugin2, { allowRootHooks: true });
  });

  const plugin2 = createPlugin("plugin2", (denzo) => {
    denzo.addHook("onRequest", () => {}, { scope: "root" });
  });

  assertThrows(() => app.register(plugin1), Error);
});
