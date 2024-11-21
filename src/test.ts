import { createSign, createPrivateKey } from 'crypto';

// 需要签名的字符串
const jsonString = JSON.stringify({
    appid: "58c8793ad66511e89e060050569d3255",
    md5: "cb88af352e8871802ec4ce60162df99d",
    timestamp: "231545134555",
    token: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjZXNoaS0wMDMiLCJyZWdpb24iOiJjZXNoaXlzLVJnaW9uIiwiZXhwIjoxNTQyNzYwNzI1LCJpYXQiOjE1NDIxNTU5MjUsImp0aSI6IjE1NDIxNTU5MjU0MzUifQ.ovydm2u5Bc0UP08RttNWrSttyde86gcUK9GxNPDDQp8",
    version: "3.1.2"
});

// RSA密钥
const privateKey = "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAM1BEzOAMVv5aTgM7khzKdcuqM7GjCPQtAoiizWLb924KIAJuGPvJhRMZowa83+4tsYmsdPt+zhOFr6OdsIhfaSHcYAo/N/ehHaot1pO54fWYbIRpuwegj54w+qMdZLxMhzRHy5ZA53j47SVwblSebRGTGpbCRf41xArxdUs+xV3AgMBAAECgYBYn3Vz8jDdvoXw3pxwCdGSCKJ4jX/q4u0pxxqGZwtJF3/dMNU9yP+PGiHY8rYaep3oVsLHd+TVvdnSM18RmTZO8hta51iBcs+zWy7PqY0GiGXNvBC3y3OBOKb49FvXawERzsY7adTmWyHNyS2RGBF7ZGbUPJVPSJiAR5vknOfogQJBAPvnUM+JDZhUzjQRkOyx5KWYT88H1LWXDS5zTTsdqhzBAJc2gjEVVCRL5aWtQS/3q/X++Oo2+wbmp0lTKXKgZjcCQQDQl45hdtqczxAUcP/aCdmIDMqCQNL1oaTtIU/WTrX4N8gjAHR/uBPPfvmxkA5zx7B8ywthAslclfpigVMkfyrBAkEAnY16D7Pq2uH/7rUl7cT9+0yebiC5u7H0Pp9DKLxPD5jvY6RmHYj3jZQi2FLauMOxvDRzPxqQOyq8arIm9Fi6VQJAPbsMbPWintN8m8ARR7KwiN3YNJIAnKbYy0CXgwHKQoonlYw17fJJEpguRwkt7b/EEDp6xJvxgY/1CJ/jPiLQQQJBAO5e2zjoZgM7glOWoz/ks9Kcu9uW8WDevs8JYyRDnxQVKDcNUlfzH3tTgLhuWco3zr2XyDMzrbUvrvOF40LaGzc=";

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

console.log(signature);