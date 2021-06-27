import { createError, Espresso, listen, Plugin } from "../mod.ts";

const testPlugin: Plugin = function (app) {
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
};

const app = new Espresso();

app.register(testPlugin, { prefix: "/test" });

app.route({
  method: "GET",
  url: "/hi",
  handler() {
    return { hello: "world!" };
  },
});

listen(app, { port: 3000 });
console.log(app.router.getRoutes());
