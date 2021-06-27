import { Espresso } from "../espresso.ts";

const internalServerError = new Response(undefined, { status: 500 });

export async function serve(app: Espresso, listener: Deno.Listener) {
  for await (const conn of listener) {
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
