import { Denzo } from "../denzo.ts";
import { HTTPOptions, HTTPSOptions, serve } from "../deps.ts";

export async function listenAndServe(
  address: undefined | null | number | string | HTTPOptions | HTTPSOptions,
  denzo: Denzo,
): Promise<void> {
  denzo.finalize();
  const server = serve(address);

  for await (const requestEvent of server) {
    denzo.handle(requestEvent);
  }
}
