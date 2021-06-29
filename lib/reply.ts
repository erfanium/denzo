interface ResponseWith {
  (r: Response | Promise<Response>): Promise<void>;
}

export interface DefaultReplyTypes {
  Response?: unknown;
}

export class ESReply<T extends DefaultReplyTypes = DefaultReplyTypes> {
  sent = false;
  statusCode = 200;
  body: T["Response"] | undefined = undefined;
  headers = new Headers();
  createdAt = performance.now();
  responseTime = 0;

  header(key: string, value: string) {
    this.headers.set(key, value);
    return this;
  }

  status(s: number) {
    this.statusCode = s;
    return this;
  }

  send(s?: T["Response"]) {
    if (this.sent) return;
    this.body = s;
    this.sent = true;
  }

  redirect(url: string, statusCode = 302) {
    this.header("location", url).status(statusCode).send();
  }
}
