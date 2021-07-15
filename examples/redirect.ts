import { Denzo, listenAndServe, printRoutes } from "../mod.ts";

const app = new Denzo();

interface RouteTypes {
  Response: {
    hello: string;
  };
}

app.route<RouteTypes>({
  method: "GET",
  url: "/google",
  handler(_request, reply) {
    reply.redirect("https://www.google.com");
  },
});

listenAndServe(3000, app);

console.log("On port 3000");
printRoutes(app);
