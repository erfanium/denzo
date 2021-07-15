import { Denzo } from "../denzo.ts";
import {
  bgWhite,
  black,
  blue,
  bold,
  gray,
  italic,
} from "https://deno.land/std@0.100.0/fmt/colors.ts";

export function printRoutes(app: Denzo) {
  console.log(bold("APP ROUTES:"));
  function readRoutes(a: Denzo, prefix: string) {
    console.log(bgWhite(black(">>")), bold(a.name));
    if (!a.routes.length) console.log(gray(italic("# no routes")));
    a.routes.forEach((r) =>
      console.log(
        blue(r.methods.toString()),
        r.urls.map((u) => gray(prefix) + u).toString(),
      )
    );
    console.log();
    a.plugins.forEach((plugin) =>
      readRoutes(plugin.context, prefix + plugin.prefix)
    );
  }

  readRoutes(app, "");
}
