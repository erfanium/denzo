import { Denzo } from "../denzo.ts";
import { findRoute } from "../lib/router.ts";
import { assert } from "./deps.ts";

const { test } = Deno;

test("[router] plugins prefix", () => {
  const app = new Denzo();
  app.register((a) => {
    a.route({ method: "GET", url: "/foo", handler() {} });
  }, { prefix: "/a" });

  app.register((a) => {
    a.route({ method: "GET", url: "/bar", handler() {} });
  }, { prefix: "/b" });

  app.finalize();

  assert(findRoute(app.routeTrees!, "GET", "/a/foo")[0]);
  assert(findRoute(app.routeTrees!, "GET", "/b/bar")[0]);
  assert(!findRoute(app.routeTrees!, "GET", "/bar")[0]);
});

test("[router] nested plugins prefix", () => {
  const app = new Denzo();
  app.register((a) => {
    a.route({ method: "GET", url: "/foo", handler() {} });

    a.register((a2) => {
      a2.route({ method: "GET", url: "/bar", handler() {} });
    }, { prefix: "/b" });
  }, { prefix: "/a" });

  app.finalize();
  assert(findRoute(app.routeTrees!, "GET", "/a/foo")[0]);
  assert(findRoute(app.routeTrees!, "GET", "/a/b/bar")[0]);
  assert(!findRoute(app.routeTrees!, "GET", "/bar")[0]);
});

test("[router] multiple methods", () => {
  const app = new Denzo();
  app.route({
    method: ["GET", "POST"],
    url: "/foo",
    handler() {},
  });

  app.finalize();

  assert(findRoute(app.routeTrees!, "GET", "/foo")[0]);
  assert(findRoute(app.routeTrees!, "POST", "/foo")[0]);
});

test("[router] multiple urls", () => {
  const app = new Denzo();
  app.route({
    method: "GET",
    url: ["/foo", "/bar"],
    handler() {},
  });

  app.finalize();

  assert(findRoute(app.routeTrees!, "GET", "/foo")[0]);
  assert(findRoute(app.routeTrees!, "GET", "/bar")[0]);
});

test("[router] multiple methods and urls", () => {
  const app = new Denzo();
  app.route({
    method: ["GET", "POST"],
    url: ["/foo", "/bar"],
    handler() {},
  });

  app.finalize();

  assert(findRoute(app.routeTrees!, "GET", "/foo")[0]);
  assert(findRoute(app.routeTrees!, "POST", "/foo")[0]);
  assert(findRoute(app.routeTrees!, "GET", "/bar")[0]);
  assert(findRoute(app.routeTrees!, "POST", "/bar")[0]);
});
