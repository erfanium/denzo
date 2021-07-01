import { Denzo } from "../mod.ts";
import { createInject } from "../utils/inject.ts";

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

const inject = createInject(app);

const response = await inject('/hi');
const body = await response.json();

console.log({
  response,
  body,
})
