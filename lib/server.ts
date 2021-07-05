import { Denzo } from "../denzo.ts";

export const noop = () => undefined;

async function handleConn(app: Denzo, conn: Deno.Conn) {
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

export async function serve(app: Denzo, listener: Deno.Listener) {
  for await (const conn of listener) {
    handleConn(app, conn).catch(noop);
  }
}
