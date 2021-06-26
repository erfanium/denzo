import { Espresso } from "../espresso.ts";

export interface ServerCallbackFn {
  (requestEvent: Deno.RequestEvent): unknown;
}

const internalServerError = new Response(undefined, { status: 500 });

export async function listen(app: Espresso, listenOptions: Deno.ListenOptions) {
  for await (const conn of Deno.listen(listenOptions)) {
    (async () => {
      for await (const requestEvent of Deno.serveHttp(conn)) {
        app
          .handle(requestEvent)
          .catch((e) => {
            console.error(e);
            requestEvent.respondWith(internalServerError);
          });
      }
    })();
  }
}
