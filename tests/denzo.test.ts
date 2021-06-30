import { Denzo } from "../denzo.ts";
import { assert, assertEquals } from "../test_deps.ts";

const { test } = Deno;

test("[denzo] plugins prefix", () => {
  const app = new Denzo();
  app.register((a) => {
    a.route({ method: "GET", url: "/foo", handler() {} });
  }, { prefix: "/a" });

  app.register((a) => {
    a.route({ method: "GET", url: "/bar", handler() {} });
  }, { prefix: "/b" });

  const routes = app.getRoutes();
  assertEquals(routes.size, 2);
  assert(routes.has("/a/foo"));
  assert(routes.has("/b/bar"));
});

test("[denzo] nested plugins prefix", () => {
  const app = new Denzo();
  app.register((a) => {
    a.route({ method: "GET", url: "/foo", handler() {} });

    a.register((a2) => {
      a2.route({ method: "GET", url: "/bar", handler() {} });
    }, { prefix: "/b" });

  }, { prefix: "/a" });

  const routes = app.getRoutes();
  assertEquals(routes.size, 2);
  assert(routes.has("/a/foo"));
  assert(routes.has("/a/b/bar"));
});
