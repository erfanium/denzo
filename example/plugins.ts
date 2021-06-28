import { Espresso } from "../mod.ts";

const app = new Espresso();

function users(app: Espresso) {
  app.route({
    method: "GET",
    url: "/",
    handler() {
      return "Get all users";
    },
  });

  app.route({
    method: "GET",
    url: "/login",
    handler() {
      return "login";
    },
  });
}

function posts(app: Espresso) {
  app.route({
    method: "GET",
    url: "/",
    handler() {
      return "Get all posts";
    },
  });
}

app.register(users, { prefix: "/users" });
app.register(posts, { prefix: "/posts" });

const listener = Deno.listen({ port: 3000 });
app.serve(listener);

console.log("On port 3030");
app.getRoutes().forEach((route, path) =>
  console.log(`${route.method} ${path}`)
);
