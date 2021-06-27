import { Node } from "../deps.ts";
import { Route } from "./route.ts";

type Params = Record<string, string>;

function hasTrailingSlash(str: string): boolean {
  if (str.length > 1 && str[str.length - 1] === "/") {
    return true;
  }

  return false;
}

export interface Router {
  add(method: string, path: string, route: Route): void;
  find(method: string, path: string): [Route, Params] | [];
  getRoutes(): Map<string, Route>;
}

export function buildRouter(): Router {
  const trees: Record<string, Node<Route>> = {};
  const routes: Map<string, Route> = new Map();

  function readNode(node: Node<Route>, prefix = '') {
    if (node.handler) routes.set('/' + prefix, node.handler);
    node.children.forEach((node) => {
      readNode(node, prefix + node.path);
    });

    return routes;
  }

  return {
    add(method: string, path: string, route: Route) {
      if (path[0] !== "/") {
        path = `/${path}`;
      }

      if (hasTrailingSlash(path)) {
        path = path.slice(0, path.length - 1);
      }

      let root = trees[method];
      if (!root) {
        root = new Node();
        trees[method] = root;
      }

      root.add(path, route);
    },
    find(method: string, path: string) {
      const node = trees[method];
      if (!node) return [];

      if (hasTrailingSlash(path)) {
        path = path.slice(0, path.length - 1);
      }

      const [handle, paramsMap] = node.find(path);
      if (!handle) return [];

      let params: Params | undefined;
      if (paramsMap) params = Object.fromEntries(paramsMap);

      return [handle, params!];
    },
    getRoutes() {
      const routes: Map<string, Route> = new Map();
      for (const method in trees) {
        readNode(trees[method]).forEach((route, path) => {
          routes.set(path, route);
        });
      }

      return routes;
    },
  };
}
