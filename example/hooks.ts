import { Espresso, listen } from "../mod.ts";

const app = new Espresso();

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

listen(app, { port: 3000 });
console.log(app.router.getRoutes());
