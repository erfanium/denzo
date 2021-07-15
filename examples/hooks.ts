import { Denzo, listenAndServe, printRoutes } from "../mod.ts";

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

app.addHook("onResponse", (_request, _reply) => {
  console.log("onResponse");
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

listenAndServe(3000, app);

console.log("On port 3000");
printRoutes(app);
