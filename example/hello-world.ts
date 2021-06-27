import { Espresso, listen } from "../mod.ts";

const app = new Espresso();

app.route({
  method: "GET",
  url: "/hi",
  handler() {
    return { hello: "world!" };
  },
});

listen(app, { port: 3000 });
console.log(app.router.getRoutes());
