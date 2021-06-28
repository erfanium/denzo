import { Espresso } from "../mod.ts";

const app = new Espresso();

interface RouteTypes {
  Body: {
    a: number;
    b: number;
  };
  Response: {
    result: number;
  };
}

app.route<RouteTypes>({
  method: "POST",
  url: "/sum",
  schema: {
    query: {
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "number" },
      },
      required: ["a", "b"],
    },
  },
  handler({ body }) {
    return {
      result: body.a + body.b,
    };
  },
});

const listener = Deno.listen({ port: 3000 });
app.serve(listener);

console.log("On port 3030");
app.router
  .getRoutes()
  .forEach((route, path) => console.log(`${route.method} ${path}`));
