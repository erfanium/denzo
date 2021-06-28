import { Espresso } from "../espresso.ts";

export const noop = (_: unknown) => undefined;

async function handleConn(app: Espresso, conn: Deno.Conn) {
  for await (const requestEvent of Deno.serveHttp(conn)) {
    app
      .handle(requestEvent)
      .catch((e) => {
        console.error(e);
        const internalServerError = new Response(undefined, { status: 500 });
        requestEvent.respondWith(internalServerError).catch(noop);
      });
  }
}

export async function serve(app: Espresso, listener: Deno.Listener) {
  for await (const conn of listener) {
    handleConn(app, conn).catch(noop);
  }
}
