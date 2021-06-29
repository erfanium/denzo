import { createKey, Denzo } from "../mod.ts";

const app = new Denzo();

const userIdKey = createKey<number>("userId");
const userLanguageKey = createKey<string>("userLanguage");

app.addHook("onRequest", (request) => {
  request.set(userIdKey, 12345);
  request.set(userLanguageKey, "en");
});

app.route({
  method: "GET",
  url: "/me",
  handler(request) {
    const userId = request.get(userIdKey);
    const lang = request.get(userLanguageKey);
    return { userId, lang };
  },
});

const listener = Deno.listen({ port: 3000 });
app.serve(listener);

console.log("On port 3030");
app.getRoutes().forEach((route, path) =>
  console.log(`${route.method} ${path}`)
);
