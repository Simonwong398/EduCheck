# 支付宝开放平台参数配置指南

## 前提条件

1. 注册支付宝开放平台开发者账号
2. 创建企业支付宝开放平台应用
3. 获取必要的密钥和证书

## 获取配置参数步骤

### 1. 应用ID (ALIPAY_APP_ID)

- 登录支付宝开放平台
- 进入"管理中心" -> "应用管理"
- 选择或创建应用，复制应用ID

### 2. 密钥生成

```bash
# 生成RSA2密钥对
openssl genrsa -out alipay_private_key.pem 2048
openssl rsa -in alipay_private_key.pem -pubout -out alipay_public_key.pem
```

### 3. 配置参数

- `ALIPAY_APP_ID`: 应用唯一标识
- `ALIPAY_PRIVATE_KEY`: 应用私钥 (alipay_private_key.pem内容)
- `ALIPAY_PUBLIC_KEY`: 支付宝公钥 (从开放平台获取)
- `ALIPAY_GATEWAY`: 支付网关地址
  - 沙箱环境: https://openapi.alipaydev.com/gateway.do
  - 生产环境: https://openapi.alipay.com/gateway.do

## 安全最佳实践

1. 使用环境变量管理敏感信息
2. 不要将私钥提交到版本控制系统
3. 定期轮换密钥
4. 使用证书加密传输

## 环境配置示例

```env
# .env文件
ALIPAY_APP_ID=2021xxxxxxxx
ALIPAY_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
ALIPAY_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----
ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do
ALIPAY_NOTIFY_URL=https://your-domain.com/api/alipay/notify
ALIPAY_RETURN_URL=https://your-domain.com/payment/return
```

## 注意事项

- 沙箱环境用于测试
- 生产环境需要企业资质
- 遵守支付宝开放平台开发者协议
