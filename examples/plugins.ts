import { createPlugin, Denzo } from "../mod.ts";
import { printRoutes } from "../utils/mod.ts";

const app = new Denzo();

const users = createPlugin("users", (denzo) => {
  denzo.route({
    method: "GET",
    url: "/",
    handler() {
      return "Get all users";
    },
  });

  denzo.route({
    method: "GET",
    url: "/login",
    handler() {
      return "login";
    },
  });
});

const posts = createPlugin("posts", (denzo) => {
  denzo.route({
    method: "GET",
    url: "/",
    handler() {
      return "Get all posts";
    },
  });
});

app.register(users, { prefix: "/users" });
app.register(posts, { prefix: "/posts" });

const listener = Deno.listen({ port: 3000 });
app.serve(listener);

console.log("On port 3030");
printRoutes(app);
