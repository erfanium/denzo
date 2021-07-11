import { createPlugin, Denzo } from "../mod.ts";
import { printRoutes } from "../utils/mod.ts";

const app = new Denzo();

const logger = createPlugin("logger", (denzo) => {
  denzo.addHook("onRequest", () => {
    console.log("New request! I can log all application requests!");
  }, { scope: "parent" });
});

app.register(logger, { allowParentHooks: true });
app.route({
  method: "GET",
  url: "/hi",
  handler() {
    return { hello: "world!" };
  },
});

const listener = Deno.listen({ port: 3000 });
app.serve(listener);

console.log("On port 3030");
printRoutes(app);
