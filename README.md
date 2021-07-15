# Denzo

Well designed web framework for Deno. similar to
[Fastify](https://github.com/fastify/fastify). Uses Deno native http server.
(which is unstable right now)

## Hello world

app.ts

```ts
import {
  Denzo,
  listenAndServe,
  printRoutes,
} from "https://raw.githubusercontent.com/irandeno/denzo/main/mod.ts";

const app = new Denzo();

interface RouteTypes {
  Response: {
    hello: string;
  };
}

app.route<RouteTypes>({
  method: "GET",
  url: "/hi",
  handler() {
    return { hello: "world!" };
  },
});

listenAndServe(3000, app);
printRoutes(app);

console.log("listening on port 3000");
```

```sh
deno run --allow-net --unstable app.ts
```

See [examples](https://github.com/erfanium/denzo/tree/main/examples)

## Goals

**Well and Reliable design**: Denzo follows Fastify design which benefit large
projects.\
**Fast**: Denzo uses brand new Deno native http server which is faster and
better for http/2 protocol.\
**First-Class validation**: Like Fastify, Denzo support JSON schemes (also
fluent-json-schema).\
**Safe**: Plugins are limited to their scope, unless you grant access.

## Differences with Fastify

Denzo is inspired by Fastify, but it doesn't mean it's a Fastify port for Deno.
There's some differences that we prefer:

### No callback support

Callbacks are fast, but supporting callbacks and promises together is
troublesome. so you should always use `async` function or return a `Promise` for
your async code.

### `Keys` instead of `decorators`

Fastify decorators design is not Typescript friendly, You can use our `Keys`
design to safely pass data between hooks. see examples/keys.ts.

## Plugins

### Official

- [denzo-cors](https://github.com/irandeno/denzo-cors)
- [denzo-logger](https://github.com/irandeno/denzo-logger)

## Discord chat

We would love to hear your feedback and questions! https://discord.gg/YP5TgWbd2C
