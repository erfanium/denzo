for await (const conn of Deno.listen({ port: 3000 })) {
  (async () => {
    for await (const { request, respondWith } of Deno.serveHttp(conn)) {
      const url = new URL(request.url);
      const result = url.searchParams.get("a")! + url.searchParams.get("b")!;
      respondWith(
        new Response(JSON.stringify({ result }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }),
      );
    }
  })();
}
