import { Espresso, listen } from "../mod.ts";

const app = new Espresso();

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

listen(app, { port: 3000 });
