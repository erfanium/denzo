import { createPlugin, Denzo } from "../mod.ts";
import { assertEquals } from "./deps.ts";

const { test } = Deno;
test("[plugin] should pass configs", () => {
  const app = new Denzo();

  const plugin = createPlugin("plugin", (_, config: { foo: string }) => {
    assertEquals(config, { foo: "bar" });
  });

  app.register(plugin, {}, { foo: "bar" });
});
