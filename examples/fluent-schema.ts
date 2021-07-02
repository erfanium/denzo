import S from "https://esm.sh/fluent-json-schema@3.0.0";
import { Denzo } from "../mod.ts";
import { printRoutes } from "../utils/mod.ts";

const app = new Denzo();

interface RouteTypes {
  Query: {
    a: string;
    b: string;
  };
  Response: {
    result: string;
  };
}

app.route<RouteTypes>({
  method: "GET",
  url: "/concat",
  schema: {
    query: S.object()
      .prop("a", S.string().required())
      .prop("b", S.string().required()),
  },
  handler(request) {
    const body = request.query;
    return {
      result: body.a + body.b,
    };
  },
});

const listener = Deno.listen({ port: 3000 });
app.serve(listener);

console.log("On port 3030");
printRoutes(app);
