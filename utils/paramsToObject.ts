export function paramsToObject(entries: URLSearchParams) {
   const result: Record<string, string> = {}
   for(const [key, value] of entries) {
     result[key] = value;
   }
   return result;
 }