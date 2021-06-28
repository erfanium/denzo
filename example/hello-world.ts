import { Espresso } from "../mod.ts";

const app = new Espresso();

interface RouteTypes {
  Response: {
    hello: string;
  };
}

app.route<RouteTypes>({
  method: "GET",
  url: "/hi",
  handler() {
    return { hello: "world!" };
  },
});

const listener = Deno.listen({ port: 3000 });
app.serve(listener);

console.log("On port 3030");
app.router
  .getRoutes()
  .forEach((route, path) => console.log(`${route.method} ${path}`));
