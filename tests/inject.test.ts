import { assertEquals } from "../test_deps.ts";
import { createInject } from "../utils/inject.ts";

const { test } = Deno;

test("[inject] should send mock request to a simple server", async () => {
  const server = (
    { request, respondWith }: Deno.RequestEvent,
  ): Promise<void> => {
    assertEquals(request.method, "GET");
    assertEquals(request.url.toString(), "http://0.0.0.0:0/foo");
    respondWith(new Response("hi there!", { status: 201 }));
    return Promise.resolve();
  };

  const inject = createInject({ handle: server });
  const response = await inject("/foo");
  assertEquals(response.status, 201);
  const body = await response.text();
  assertEquals(body, "hi there!");
});

test("[inject] should send mock request with body to a simple server", async () => {
  const server = async (
    { request, respondWith }: Deno.RequestEvent,
  ): Promise<void> => {
    assertEquals(request.method, "POST");
    assertEquals(request.url.toString(), "http://0.0.0.0:0/foo");

    const body = await request.json();
    assertEquals(body, { foo: "bar" });

    respondWith(new Response("hi there!", { status: 201 }));
  };

  const inject = createInject({ handle: server });
  const response = await inject("/foo", {
    method: "POST",
    body: JSON.stringify({ foo: "bar" }),
  });

  assertEquals(response.status, 201);
  const body = await response.text();
  assertEquals(body, "hi there!");
});
