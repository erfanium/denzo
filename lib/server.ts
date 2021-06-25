export interface ServerCallbackFn {
  (requestEvent: Deno.RequestEvent): unknown;
}

export async function buildServer(
  listenOptions: Deno.ListenOptions,
  cb: ServerCallbackFn,
) {
  for await (const conn of Deno.listen(listenOptions)) {
    (async () => {
      for await (const requestEvent of Deno.serveHttp(conn)) {
        cb(requestEvent);
      }
    })();
  }
}
