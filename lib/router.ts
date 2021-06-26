import { Route } from "./route.ts";

type Params = Record<string, string>;

export function buildRouter() {
  const routes = new Map<string, Route>();
  return {
    add(method: string, path: string, route: Route) {
      routes.set(method + path, route);
    },
    find(method: string, path: string): [Route, Params] | [] {
      const route = routes.get(method + path);
      if (route) return [route, {}];
      return [];
    },
    getRoutes(): unknown {
      return routes;
    },
  };
}
