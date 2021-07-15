import { createPlugin, Denzo, listenAndServe, printRoutes } from "../mod.ts";

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

listenAndServe(3000, app);

console.log("On port 3000");
printRoutes(app);
