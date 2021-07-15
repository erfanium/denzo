import { createKey, Denzo, listenAndServe, printRoutes } from "../mod.ts";

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

listenAndServe(3000, app);

console.log("On port 3000");
printRoutes(app);
