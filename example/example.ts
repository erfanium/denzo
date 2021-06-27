import { createError, Espresso, listen } from "../mod.ts";

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

app.route({
  method: "GET",
  url: "/concat",
  schema: {
    query: {
      type: "object",
      properties: {
        a: { type: "string" },
        b: { type: "string" },
      },
      required: ["a", "b"],
    },
  },
  handler(request) {
    const body = request.query as any;
    return {
      result: body.a + body.b,
    };
  },
});

const MY_ERROR = createError("MY_ERROR", 400, "Custom Message");

app.route({
  method: "GET",
  url: "/error",
  handler() {
    throw new MY_ERROR();
  },
});

listen(app, { port: 3000 });
console.log(app.router.getRoutes());
