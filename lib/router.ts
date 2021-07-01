import { Node } from "../deps.ts";
import { HTTPMethods } from "./httpMethods.ts";
import { Route } from "./route.ts";

type Params = Record<string, string>;

function hasTrailingSlash(str: string): boolean {
  if (str.length > 1 && str[str.length - 1] === "/") {
    return true;
  }

  return false;
}

export type RouteTrees = Record<string, Node<Route>>;

export function addRoutes(
  routeTrees: RouteTrees,
  methods: HTTPMethods[],
  path: string,
  route: Route,
): void {
  if (path[0] !== "/") {
    path = `/${path}`;
  }

  if (hasTrailingSlash(path)) {
    path = path.slice(0, path.length - 1);
  }

  const addToRouteTrees = (methodItem: HTTPMethods) => {
    let root = routeTrees[methodItem];
    if (!root) {
      root = new Node();
      routeTrees[methodItem] = root;
    }
    root.add(path, route);
  };

  methods.forEach(addToRouteTrees);
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

function readNode(node: Node<Route>, routes: Map<string, Route>, prefix = "") {
  if (node.handler) routes.set(prefix + node.path, node.handler);
  node.children.forEach((child) => {
    readNode(child, routes, prefix + node.path);
  });

  return routes;
}

export function getRoutes(routeTrees: RouteTrees): Map<string, Route> {
  const routes: Map<string, Route> = new Map();
  for (const method in routeTrees) {
    readNode(routeTrees[method], routes).forEach((route, path) => {
      routes.set(path, route);
    });
  }

  return routes;
}
