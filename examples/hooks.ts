import { Denzo } from "../mod.ts";
import { printRoutes } from "../utils/mod.ts";

const app = new Denzo();

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

app.addHook("onRequest", async () => {
  console.log("global onRequest1");
  await delay(500);
});

app.addHook("onRequest", async () => {
  console.log("global onRequest2");
  await delay(500);
});

app.addHook("preHandler", async () => {
  console.log("global preHandler");
  await delay(500);
});

app.addHook("onError", (_request, _reply, error) => {
  console.log("onError", error);
});

app.route({
  method: "GET",
  url: "/hi",
  async preHandler() {
    console.log("route preHandler");
    await delay(500);
  },
  handler() {
    return { hello: "world!" };
  },
});

app.route({
  method: "GET",
  url: "/error",
  handler() {
    throw new Error("eeee");
  },
});

const listener = Deno.listen({ port: 3000 });
app.serve(listener);

console.log("On port 3030");
printRoutes(app);
