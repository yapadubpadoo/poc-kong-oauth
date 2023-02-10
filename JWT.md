# poc-kong-jwt

## Prepare RS256 Key Pair

```bash
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
openssl genrsa -out private.pem 2048
```

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

## Create a consumer

```bash
curl -k -i -X POST https://localhost:8001/consumers/ \
  --data "username=mobile-app"
```

## Create a JWT credential

Grab the Firebase public key from https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com and save it into `.pem` file

```bash
curl -k -i -X POST https://localhost:8001/consumers/mobile-app/jwt \
  --data "algorithm=RS256" \
  --data "key=user-service" \
  --data-urlencode "rsa_public_key=-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1v3rwj8bX0AsP41oWxor
xmayIElBUzbXgR7n71fysOzTcuq5CfokGC3HO+H2QN9STdMjZaT2Y5gDk4KKnWRM
PB3eBNeEE1sVCD3bCY4lhuEoQWCy0uEv3rioYJcSfs7lU0q4RzoMnbdtzIC1KlDN
xJq4vV3DRW59AJVgpn9Ue0d0E2dys4kmCiY5GHKzsapX+R5+/L8X+JpYo1qVLLuN
gyxzGwGxm9cbocvdmSMLuXG96jUQZRAIYVvZw33QfI4H0QsN/jZyy5vWparCJkPV
VneEcgLLyLsRGSFVx8je1riGJnYdXyozE8pKAhl3Fdezy3Jhw2FS1LMV2XGkDFxd
GwIDAQAB
-----END PUBLIC KEY-----
"
```

## Craft an JWT access token

```bash
node auth-service-jwt.js

```

## Access the service

```bash
curl -k -i -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjgwMWM4ODc5ODA4YjA3MWM0OTkyZjYwNzMwOGQ5NTVmIn0.eyJ1c2VyIjoxLCJpc3MiOiJ1c2VyLXNlcnZpY2UifQ.e2AOAMfVs8TPPnWU68UjIqVYG34Ig3R7P9RvOFRrGGaLg1nORFuC3TEAqNWhP3iRFigUCxosk1wX9c5lhu4C_WwrA1C6-zBi2KP7iVSfUxuBwxFvxr3kkDOXoJNaGeKNRTHVXwO-4JBUzpjYSmuwmUL6Pb2b0VazfL1Kbe-ZtVxpGE-thGtYYfCRgkTO1uj3g8XaDzHa5O39NR4AqxXnXJaruTgXLFqfNacIi3fal6rrhCOfmAHL0CLv7gkevrhOCNjkybhrdU-7c-ie2AWtZiWRREIQBzAXJZT9ZP9xhKbdZzIKPDuVNyn-MykNKupw4nfvWOfqEMX5Cpr6U5XUM' \
    -X GET 'https://localhost:8000/api3/anything'
```
