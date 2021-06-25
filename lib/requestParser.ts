export const NO_PARSER_FOUND = Symbol('NO_PARSER_FOUND')

export function parseRequest(request: Request) {
   if (request.headers.get('content-type') === 'application/json') return request.json()
   return NO_PARSER_FOUND
}