import { Espresso } from '../espresso.ts'

const app = new Espresso()

app.route({
   method: 'GET',
   url: '/hi',
   handler() {
      return { hello: 'world!' }
   }
})

app.route({
   method: 'POST',
   url: '/echo',
   handler(request) {
      return request.body
   }
})


app.listen({ port: 3000 })
console.log(app.router.getRoutes())