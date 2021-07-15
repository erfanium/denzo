import { Denzo, printRoutes, serve } from "../mod.ts";

const app = new Denzo();

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

app.finalize();
const server = serve(3000);

setTimeout(() => {
  server.close();
}, 10 * 1000);

console.log("On port 3000");
console.log("Server will shutdown after 10 seconds");
for await (const requestEvent of server) {
  app.handle(requestEvent);
}
