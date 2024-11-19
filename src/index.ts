import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

const app = new Hono()

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
})

app.post(
  '/users/new',
  zValidator('json', userSchema, (result, c) => {
    if (!result.success) {
      return c.text('Invalid!', 400)
    }
  }),
  async (c) => {
    const user = c.req.valid('json')
    console.log(user.name) // string
    console.log(user.age) // number
  }
)

app.get("/", (c) => {
  return c.text('hello hono')
})

export default app