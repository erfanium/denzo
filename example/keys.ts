import { Espresso, listen, makeKey } from "../mod.ts";

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

listen(app, { port: 3000 });
console.log(app.router.getRoutes());
