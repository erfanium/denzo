import { Espresso, listen } from "../mod.ts";

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

listen(app, { port: 3000 });

app.router.getRoutes().forEach((route, path) =>
  console.log(`${route.method} ${path}`)
);
