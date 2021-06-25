export class ESReply {
   hasCalled = false
   statusCode = 200
   body: unknown
   status(s: number) {
      this.statusCode = s
      this.hasCalled = true
      return this
   }

   send(s: unknown) {
      this.body = s
      this.hasCalled = true
   }
}

