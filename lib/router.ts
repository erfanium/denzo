import { Denzo } from "../denzo.ts";
import { Node } from "../deps.ts";
import { HTTPMethods } from "./httpMethods.ts";
import { Route } from "./route.ts";

type Params = Record<string, string>;

type PartialRecord<K extends string, T> = {
  [P in K]?: T;
};

export type RouteTrees = PartialRecord<HTTPMethods, Node<Route>>;

function hasTrailingSlash(str: string): boolean {
  if (str.length > 1 && str[str.length - 1] === "/") {
    return true;
  }

  return false;
}

function add(
  routeTrees: RouteTrees,
  method: HTTPMethods,
  path: string,
  route: Route,
): void {
  if (path[0] !== "/") {
    throw new Error(`path should starts with slash, but received '${path}'.`);
  }

  if (hasTrailingSlash(path)) {
    path = path.slice(0, path.length - 1);
  }

  let root = routeTrees[method];
  if (!root) {
    root = new Node();
    routeTrees[method] = root;
  }
  root.add(path, route);
}

function addRoute(
  routeTrees: RouteTrees,
  prefix: string,
  route: Route,
): void {
  const paths = route.urls.map((url) => prefix + url);
  route.methods.forEach((method) =>
    paths.forEach((path) => add(routeTrees, method, path, route))
  );
}

export function buildTrees(root: Denzo): RouteTrees {
  const trees: RouteTrees = {};
  function addPluginRoutes(a: Denzo, prefix: string) {
    a.routes.forEach((r) => addRoute(trees, prefix, r));
    a.plugins.forEach((plugin) =>
      addPluginRoutes(plugin.context, prefix + plugin.prefix)
    );
  }

  addPluginRoutes(root, "");
  return trees;
}

export function findRoute(
  routeTrees: RouteTrees,
  method: HTTPMethods,
  path: string,
): [Route, Params] | [] {
  const node = routeTrees[method];
  if (!node) return [];

  if (hasTrailingSlash(path)) {
    path = path.slice(0, path.length - 1);
  }

  const [handle, paramsMap] = node.find(path);
  if (!handle) return [];

  let params: Params | undefined;
  if (paramsMap) params = Object.fromEntries(paramsMap);

  return [handle, params!];
}
