interface ResponseWith {
  (r: Response | Promise<Response>): Promise<void>;
}

export interface DefaultReplyTypes {
  Response?: unknown;
}

export class ESReply<T extends DefaultReplyTypes = DefaultReplyTypes> {
  responseWith: ResponseWith;
  sent = false;
  statusCode = 200;
  body: T["Response"] | undefined = undefined;
  headers = new Headers();

  constructor(rw: ResponseWith) {
    this.responseWith = rw;
  }

  code(s: number) {
    this.statusCode = s;
    return this;
  }

  send(s?: T["Response"]) {
    if (this.sent) return;
    this.body = s;
    this.sent = true;
  }
}
