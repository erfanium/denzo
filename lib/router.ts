import { RouteOptions } from "./route.ts";

type Params = Record<string, string>

export function buildRouter() {
   const routes = new Map<string, RouteOptions>()
   return {
      add(method: string, path: string, route: RouteOptions) {
         routes.set(method + path, route)
      },
      find(method: string, path: string): [RouteOptions, Params] | [] {
         const route = routes.get(method + path)
         if (route) return [route, {}]
         return []
      },
      getRoutes(): unknown {
         return routes
      }
   }
}