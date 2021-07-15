import { createPlugin, Denzo, listenAndServe, printRoutes } from "../mod.ts";

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

listenAndServe(3000, app);

console.log("On port 3000");
printRoutes(app);
