import { Denzo } from "../denzo.ts";

export function printRoutes(app: Denzo) {
  function readRoutes(a: Denzo, prefix: string) {
    a.routes.forEach((r) => console.log(r.methods.toString(), prefix + r.url));
    a.plugins.forEach((plugin) =>
      readRoutes(plugin.context, prefix + plugin.prefix)
    );
  }

  readRoutes(app, "");
}
