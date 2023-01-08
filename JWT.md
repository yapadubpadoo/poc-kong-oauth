# poc-kong-jwt

The steps below reuse some result of [OAuth 2.0 POC](README.md)

## Create test service

Create API 3

```bash
curl -k -i -X POST https://localhost:8001/services \
  --data name=api3 \
  --data url='https://httpbin.org'
```

Add route

```bash
curl -k -i -X POST https://localhost:8001/services/api3/routes \
  --data 'paths[]=/api3' \
  --data name=api3
```

Add JWT authentication

```bash
curl -k -i -X POST https://localhost:8001/services/api3/plugins \
    --data "name=jwt"
```

## Create a JWT credential

```bash
curl -k -i -X POST https://localhost:8001/consumers/company1/jwt -H "Content-Type: application/x-www-form-urlencoded"
```

it will produce the result like this

```json
{
  "id": "7a69abf1-6791-4ed0-9995-f1afafe83dbe",
  "secret": "Pb0vmuz8RaaMI3LxuH5dqnuP0abpZ0f1", # this is JWT secret
  "consumer": {
    "id": "edb883f2-1340-4690-90dd-8e1ac7f2cde7"
  },
  "algorithm": "HS256",
  "created_at": 1673188973,
  "tags": null,
  "rsa_public_key": null,
  "key": "oPA3TtDM40XdlhVXfFuzB1FYNCFKIjGV" # will be used as iss when signed
}
```

## Craft an JWT access token

Open this link and generate JWT https://jwt.io/#debugger-io?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJvUEEzVHRETTQwWGRsaFZYZkZ1ekIxRllOQ0ZLSWpHViJ9.YclHdPyqwglq19l99OZx4rIk7E3VroypkesmH-YYvsU

Payload

```json
{
  "iss": "oPA3TtDM40XdlhVXfFuzB1FYNCFKIjGV"
}
```

and use the generated secert above, then we will get the JWT token.

Access the service

```bash
curl -k -i -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJvUEEzVHRETTQwWGRsaFZYZkZ1ekIxRllOQ0ZLSWpHViJ9.mt5jOT09ZsgegupS_FyPZn8r0tTGmho2mIjcheXdkqY' \
    -X GET 'https://localhost:8000/api3/anything'
```
