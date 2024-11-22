import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { bodyToMd5, generateSig, readEnv, signature } from './utils'
import { baseHttp } from './baseHttp'
import { db } from './db'
import { users } from './db/schema/users'
import { cors } from "hono/cors"
import { basicAuth } from 'hono/basic-auth'
import invariant from 'tiny-invariant'

const app = new Hono()

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
})

app.use(prettyJSON()) 
app.use(cors())

app.use(
  '/auth/*',
  basicAuth({
    username: 'lanhong',
    password: 'gzfz@)@!',
  })
)

app.get('/auth/page', (c) => {
  return c.text('You are authorized')
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
    return c.json({
      name: user.name,
      age: user.age
    })
  }
)

app.get("/", (c) => {
  return c.text('hello hono')
})

const config = readEnv()

const prefixUrl = 'https://open.andmu.cn/'


app.get('/token', async (c) => {
  const requestBody = {
    sig: generateSig(config.appid!, config.secret!),
    operatorType: 1
  }
  const timestamp = Date.now()
  const jsonResult = await baseHttp.post('v3/open/api/token', {
    prefixUrl: prefixUrl, json: requestBody, 
    headers: {
      appid: config.appid!,
      md5: bodyToMd5(JSON.stringify(requestBody)),
      timestamp: timestamp.toString(),
      version: '1.0.0',
      signature: signature(timestamp, requestBody, config.rsa!),
    }
  }).json()

  return c.json({
    data: jsonResult
  })
})

const  testToken = "eyJhbGciOiJIUzI1NiJ9.eyJwcm9mZXNzaW9uIjoxLCJhcHBpZCI6ImNlODQ4MGQxOTkyNzRkMzJhYjE5YjA5ZDUzNWIwZjgwIiwib3BlcmF0b3JUeXBlIjoxLCJvcGVyYXRvciI6ImNlODQ4MGQxOTkyNzRkMzJhYjE5YjA5ZDUzNWIwZjgwIiwianRpIjoiMTg5MTQ5Nzk2MzU5NDQyNjQ1MCIsImlhdCI6MTczMjI3MTMzMSwic3ViIjoiY2U4NDgwZDE5OTI3NGQzMmFiMTliMDlkNTM1YjBmODAiLCJleHAiOjE3MzI4NzYxMzF9.dE85T2vRAkia5GskhtN9lurjUenN7WpIy4gRmmuspyw"

app.get('farmList/:farmNodeId/deviceList', async (c) => {
  const farmNodeId = c.req.param('farmNodeId')
  invariant(farmNodeId, 'farmNodeId is required!');

  const deviceBody = {
    nodeId: farmNodeId,
    queryType: 1
  }

  const timestamp = Date.now()

  const jsonResult = await baseHttp.post('v3/open/api/node/tree', {
    prefixUrl: prefixUrl, json: deviceBody, 
    headers: {
      appid: config.appid!,
      md5: bodyToMd5(JSON.stringify(deviceBody)),
      timestamp: timestamp.toString(),
      token: testToken,
      version: '1.0.0',
      signature: signature(timestamp, deviceBody, config.rsa!, testToken),
    }
  }).json()

  return c.json({data: {
    deviceList: jsonResult
  }})
})

app.get('/users', async (c) => {
  const userResult = await db.select().from(users);
  return c.json({
    result: userResult
  })
})

export default app