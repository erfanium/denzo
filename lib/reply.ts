interface ResponseWith {
  (r: Response | Promise<Response>): Promise<void>;
}

export class ESReply {
  responseWith: ResponseWith;
  sent = false;
  statusCode = 200;
  body: unknown;
  headers = new Headers();

  constructor(rw: ResponseWith) {
    this.responseWith = rw;
  }

  status(s: number) {
    this.statusCode = s;
    return this;
  }

  send(s?: unknown) {
    if (this.sent) return;
    this.body = s;
    this.sent = true;
  }
}
