import { Hono } from 'hono'
import { bodyToMd5, generateSig, readEnv, signature } from './utils'
import { baseHttp } from './baseHttp'
import { db } from './db'
import { users } from './db/schema/users'
import { cors } from "hono/cors"
import { basicAuth } from 'hono/basic-auth'
import invariant from 'tiny-invariant'
import { farmJson, getFarmNodeId } from './farm'
import dayjs from 'dayjs'
import type { BaseRes } from './type'

const app = new Hono()
const config = readEnv()
const prefixUrl = 'https://open.andmu.cn/'

app.use(cors())

app.get("/", (c) => {
  return c.text('hello hono')
})

app.get('/token', basicAuth({
  username: 'lanhong',
  password: 'gzfz@)@!',
}), async (c) => {
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

const testToken = process.env.beefToken

app.get('/farmList', async (c) => {
  return c.json({
    result: {
      farmList: farmJson
    }
  })
})

async function getThumbnail(deviceId: string) {
  invariant(deviceId, 'deviceId is required!');

  const playerBody = {
    deviceId: deviceId,
  }
  const timestamp = Date.now()

  const jsonResult = await baseHttp.post<BaseRes<any>>('v3/open/api/camera/thumbnail/realtime', {
    prefixUrl: prefixUrl, json: playerBody, 
    headers: {
      appid: config.appid!,
      md5: bodyToMd5(JSON.stringify(playerBody)),
      timestamp: timestamp.toString(),
      token: testToken,
      version: '1.0.0',
      signature: signature(timestamp, playerBody, config.rsa!, testToken),
    }
  }).json()

  return jsonResult.data.url
}

// 创建一个异步生成器函数
async function getAllThumbnail(deviceList: any[]) {
  const newDeviceList = deviceList
  const allRequest = deviceList.map(device => getThumbnail(device.deviceId))
  const responses = await Promise.all(allRequest);

  responses.forEach((result, index) => {
    newDeviceList[index].url = result
  })

  return newDeviceList
}

app.get('/farmList/:farmNodeId/deviceList', async (c) => {
  const farmNodeId = c.req.param('farmNodeId')
  invariant(farmNodeId, 'farmNodeId is required!');

  invariant(farmNodeId, 'farmNodeId is required!');
  
  const deviceBody = {
    nodeId: farmNodeId,
    queryType: 1
  }

  const timestamp = Date.now()

  const jsonResult = await baseHttp.post<BaseRes<any>>('v3/open/api/node/tree', {
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

  const deviceList = jsonResult.data.device

  let newDeviceList = await getAllThumbnail(deviceList)

  return c.json({data: {
    deviceList: newDeviceList
  }})
})

app.get('/farmDetail/:farmId/deviceList', async (c) => {
  const farmId = c.req.param('farmId')
  invariant(farmId, 'farmId is required!');

  const farmDetail = getFarmNodeId(farmId)
  console.log('farmDetail', farmDetail)
  const farmNodeId = farmDetail?.nodeId
  
  if(!farmNodeId) {
    return c.json({data: {
      haveMonitor: false,
      deviceList: []
    }})
  }

  
  const deviceBody = {
    nodeId: farmNodeId,
    queryType: 1
  }

  const timestamp = Date.now()

  const jsonResult = await baseHttp.post<BaseRes<any>>('v3/open/api/node/tree', {
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

  const deviceList = jsonResult.data.device

  let newDeviceList = await getAllThumbnail(deviceList)
  
  return c.json({data: {
    haveMonitor: true,
    deviceList: newDeviceList
  }})
})

app.get('/websdk/player/:deviceId', async (c) => {
  const deviceId = c.req.param('deviceId')
  invariant(deviceId, 'deviceId is required!');

  const playerBody = {
    deviceId: deviceId,
    endTime: dayjs().add(1, 'day').valueOf()
  }

  const timestamp = Date.now()

  const jsonResult = await baseHttp.post<BaseRes<any>>('v3/open/api/websdk/live', {
    prefixUrl: prefixUrl, json: playerBody, 
    headers: {
      appid: config.appid!,
      md5: bodyToMd5(JSON.stringify(playerBody)),
      timestamp: timestamp.toString(),
      token: testToken,
      version: '1.0.0',
      signature: signature(timestamp, playerBody, config.rsa!, testToken),
    }
  }).json()

  if( jsonResult.resultCode === '000000') {
    return c.json({
      data: jsonResult.data,
      resultCode: jsonResult.resultCode,
      resultMsg: jsonResult.resultMsg
    })
  }

  return c.json({
    resultCode: jsonResult.resultCode,
    resultMsg: jsonResult.resultMsg
  })
})

app.get('/player/flv/:deviceId', async (c) => {
  const deviceId = c.req.param('deviceId')
  invariant(deviceId, 'deviceId is required!');

  const playerBody = {
    deviceId: deviceId,
    endTime: dayjs().add(10, 'minute').valueOf()
  }

  const timestamp = Date.now()

  const jsonResult = await baseHttp.post<BaseRes<any>>('v3/open/api/device/flv', {
    prefixUrl: prefixUrl, json: playerBody, 
    headers: {
      appid: config.appid!,
      md5: bodyToMd5(JSON.stringify(playerBody)),
      timestamp: timestamp.toString(),
      token: testToken,
      version: '1.0.0',
      signature: signature(timestamp, playerBody, config.rsa!, testToken),
    }
  }).json()

  if( jsonResult.resultCode === '000000') {
    return c.json({
      data: jsonResult.data,
      resultCode: jsonResult.resultCode,
      resultMsg: jsonResult.resultMsg
    })
  }

  return c.json({
    resultCode: jsonResult.resultCode,
    resultMsg: jsonResult.resultMsg
  })
})

app.get('/player/hls/:deviceId', async (c) => {
  const deviceId = c.req.param('deviceId')
  invariant(deviceId, 'deviceId is required!');

  const playerBody = {
    deviceId: deviceId,
    endTime: dayjs().add(10, 'minute').valueOf()
  }

  const timestamp = Date.now()

  const jsonResult = await baseHttp.post<BaseRes<any>>('v3/open/api/device/hls', {
    prefixUrl: prefixUrl, json: playerBody, 
    headers: {
      appid: config.appid!,
      md5: bodyToMd5(JSON.stringify(playerBody)),
      timestamp: timestamp.toString(),
      token: testToken,
      version: '1.0.0',
      signature: signature(timestamp, playerBody, config.rsa!, testToken),
    }
  }).json()

  if( jsonResult.resultCode === '000000') {
    return c.json({
      data: jsonResult.data,
      resultCode: jsonResult.resultCode,
      resultMsg: jsonResult.resultMsg
    })
  }

  return c.json({
    resultCode: jsonResult.resultCode,
    resultMsg: jsonResult.resultMsg
  })
})

app.get('/users', async (c) => {
  const userResult = await db.select().from(users);
  return c.json({
    result: userResult
  })
})

export default app