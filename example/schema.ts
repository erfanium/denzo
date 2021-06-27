import { Espresso } from "../mod.ts";

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

const listener = Deno.listen({ port: 3000 });
app.serve(listener);

console.log('On port 3030')
app.router.getRoutes().forEach((route, path) =>
  console.log(`${route.method} ${path}`)
);