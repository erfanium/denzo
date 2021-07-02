import { Denzo } from "../denzo.ts";
import { findRoute } from "../lib/router.ts";
import { createPlugin } from "../mod.ts";
import { assert } from "./deps.ts";

const { test } = Deno;

test("[router] plugins prefix", () => {
  const app = new Denzo();
  const a = createPlugin("a", (denzo) => {
    denzo.route({ method: "GET", url: "/foo", handler() {} });
  });

  const b = createPlugin("b", (denzo) => {
    denzo.route({ method: "GET", url: "/bar", handler() {} });
  });

  app.register(a, { prefix: "/a" });
  app.register(b, { prefix: "/b" });
  app.finalize();

  assert(findRoute(app.routeTrees!, "GET", "/a/foo")[0]);
  assert(findRoute(app.routeTrees!, "GET", "/b/bar")[0]);
  assert(!findRoute(app.routeTrees!, "GET", "/bar")[0]);
});

test("[router] nested plugins prefix", () => {
  const app = new Denzo();
  const a = createPlugin("a", (denzo) => {
    denzo.route({ method: "GET", url: "/foo", handler() {} });
    denzo.register(b, { prefix: "/b" });
  });

  const b = createPlugin("b", (denzo) => {
    denzo.route({ method: "GET", url: "/bar", handler() {} });
  });

  app.register(a, { prefix: "/a" });
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
