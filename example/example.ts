import { Espresso, listen } from "../mod.ts";

const app = new Espresso();

app.route({
  method: "GET",
  url: "/hi",
  handler() {
    return { hello: "world!" };
  },
});

app.route({
  method: "POST",
  url: "/echo",
  handler(request) {
    return request.body;
  },
});

app.route({
  method: "POST",
  url: "/sum",
  schema: {
    body: {
      type: "object",
      properties: {
        a: { type: "integer" },
        b: { type: "integer" },
      },
      required: ["a", "b"],
    },
  },
  handler(request) {
    const body = request.body as any;
    return {
      result: body.a + body.b,
    };
  },
});

listen(app, { port: 3000 });
console.log(app.router.getRoutes());
