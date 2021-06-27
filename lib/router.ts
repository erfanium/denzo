import { Route } from "./route.ts";

type Params = Record<string, string>;

export interface Router {
  add(method: string, path: string, route: Route): void;
  find(method: string, path: string): [Route, Params] | [];
  getRoutes(): unknown;
}

export function buildRouter(): Router {
  const routes = new Map<string, Route>();
  return {
    add(method: string, path: string, route: Route) {
      routes.set(method + path, route);
    },
    find(method: string, path: string) {
      const route = routes.get(method + path);
      if (route) return [route, {}];
      return [];
    },
    getRoutes(): unknown {
      return routes;
    },
  };
}
