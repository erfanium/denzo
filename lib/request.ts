import { RouteGenericInterface } from "./route.ts";

export interface ESRequest<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
> {
  params: RouteGeneric["Params"];
  query: RouteGeneric["Querystring"];
  body: RouteGeneric["Body"];

  readonly headers: Headers & RouteGeneric["Headers"]; // this enables the developer to extend the existing http(s|2) headers list
  readonly url: string;
  readonly method: string;
}
