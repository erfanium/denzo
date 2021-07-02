import { Denzo } from "../denzo.ts";

export function printRoutes(app: Denzo) {
  function readRoutes(a: Denzo, prefix: string) {
    a.routes.forEach((r) =>
      console.log(r.methods.toString(), r.urls.map((u) => prefix + u))
    );
    a.plugins.forEach((plugin) =>
      readRoutes(plugin.context, prefix + plugin.prefix)
    );
  }

  readRoutes(app, "");
}
