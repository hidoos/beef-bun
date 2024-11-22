import { createHash, createPrivateKey, createSign } from "crypto";
import { Buffer } from "buffer"

export function readEnv() {
  return {
    appid: process.env.appid,
    secret: process.env.secret,
    rsa: process.env.rsa
  }
}

export function generateSig(appid:string, secret:string) {
  try {
    const combinedString = appid + secret;
    const hash = createHash("md5").update(combinedString).digest("hex");
    return hash;
  } catch (error) {
    console.error("Error generating signature:", error);
    return null; // Or handle the error as needed
  }
}


export const bodyToMd5 = (bodyJson: string) => createHash("md5").update(bodyJson).digest("hex")


// RSA 密钥
export function signature(timestamp: number, reqeustBody: any, privateKey: string, withToken = '') {
  // 需要签名的字符串
  let jsonString = JSON.stringify({
    appid: process.env.appid,
    md5: bodyToMd5(JSON.stringify(reqeustBody)),
    timestamp: timestamp.toString(),
    version: "1.0.0",
  });

  if(withToken) {
    jsonString = JSON.stringify({
      appid: process.env.appid,
      md5: bodyToMd5(JSON.stringify(reqeustBody)),
      timestamp: timestamp.toString(),
      token: withToken,
      version: "1.0.0",
    });
  }

  // 创建签名对象
  const sign = createSign('SHA1');
  const privateKeyObj = createPrivateKey({
      key: Buffer.from(privateKey, 'base64'),
      format: 'der',
      type: 'pkcs8'
  });

  // 更新数据并生成签名
  sign.update(jsonString, 'utf-8');
  const signature = sign.sign(privateKeyObj, 'base64');
  return signature
}