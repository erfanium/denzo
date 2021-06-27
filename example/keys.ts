import { Espresso, makeKey } from "../mod.ts";

const app = new Espresso();

const userIdKey = makeKey<number>("userId");
const userLanguageKey = makeKey<string>("userLanguage");

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

console.log('On port 3030')
app.router.getRoutes().forEach((route, path) =>
  console.log(`${route.method} ${path}`)
);