# poc-kong-oauth2.0

Implementing [Kong OAuth 2.0 plugin](https://docs.konghq.com/hub/kong-inc/oauth2/) with these suggestions

- https://github.com/Kong/kong/issues/1488#issuecomment-533794783
- https://github.com/Kong/kong/issues/1488#issuecomment-316016566

The concept is implement the authentication service that can use generated token across services in Kong.
The key is use `config.global_credentials=true` of OAuth 2.0 plugin

Ref

- https://konghq.com/blog/kong-gateway-oauth2
- https://docs.konghq.com/hub/kong-inc/oauth2/

## Generate self-signed certificates

Kong OAuth 2.0 requires HTTPS

```text
Note: As per the OAuth2 specs, this plugin requires the underlying service to be served over HTTPS. To avoid any confusion, we recommend that you configure the Route used to serve the underlying Service to only accept HTTPS traffic (using its `protocols` property).
```

```bash
cd certificate
openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365 # then follow the instuction
openssl rsa -in keytmp.pem -out key.pem # then follow the instuction
```

See `docker-compose.yml` on how the files mount and use in Kong

## Create test services

Create API 1 and API 2

```bash
curl -k -i -X POST https://localhost:8001/services \
  --data name=api1 \
  --data url='https://httpbin.org'

curl -k -i -X POST https://localhost:8001/services \
  --data name=api2 \
  --data url='https://httpbin.org'
```

Add routes

```bash
curl -k -i -X POST https://localhost:8001/services/api1/routes \
  --data 'paths[]=/api1' \
  --data name=api1

curl -k -i -X POST https://localhost:8001/services/api2/routes \
  --data 'paths[]=/api2' \
  --data name=api2
```

Veify request to both APIs

```bash
curl -k -i -X GET https://localhost:8000/api1/anything
curl -k -i -X GET https://localhost:8000/api2/anything
```

These will proxy a request to https://httpbin.org/anything

## Create OAuth 2.0 API endpoint

Create a dummy service

```bash
curl -k -i -X POST https://localhost:8001/services \
  --data name=authentication \
  --data url='https://httpbin.org'

curl -k -i -X POST https://localhost:8001/services/authentication/routes \
  --data 'paths[]=/authentication' \
  --data name=authentication
```

Enable OAuth 2.0 plugin

```bash
curl -k -i -X POST https://localhost:8001/services/authentication/plugins \
    --data "name=oauth2"  \
    --data "config.enable_authorization_code=true" \
    --data "config.enable_implicit_grant=true" \
    --data "config.enable_client_credentials=true" \
    --data "config.global_credentials=true"
```

## Create a consumer

```bash
curl -k -i -X POST https://localhost:8001/consumers/ \
  --data "username=company1"
```

Create an application of the consumer

```bash
curl -k -i -X POST https://localhost:8001/consumers/company1/oauth2 \
 --data "name=Company1%20Application" \
 --data "client_id=company1" \
 --data "client_secret=supersercet" \
 --data "redirect_uris=http://company1/application/" \
 --data "hash_secret=true"
```

## Create an access token

### [Authorization Code Grant](https://www.rfc-editor.org/rfc/rfc6749#section-4.1)

Acquire a code

```bash
  curl -k -i -X POST 'https://localhost:8000/authentication/oauth2/authorize' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'client_id=company1' \
    --data-urlencode 'provision_key=uQpS97P5A5iq2ARLpPtF87lj8d9SKWYG' \
    --data-urlencode 'authenticated_userid=user100' \
    --data-urlencode 'response_type=code'
```

Exchange for an access token

```bash
  curl -k -i -X POST 'https://localhost:8000/authentication/oauth2/token' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'grant_type=authorization_code' \
    --data-urlencode 'code=syZsR2nNeXdlVIKMOfWJ8HwCFxSufV58' \
    --data-urlencode 'client_id=company1' \
    --data-urlencode 'client_secret=supersercet'
```

### [Implicit Grant](https://www.rfc-editor.org/rfc/rfc6749#section-4.2)

```bash
  curl -k -i -X POST 'https://localhost:8000/authentication/oauth2/authorize' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'client_id=company1' \
    --data-urlencode 'provision_key=uQpS97P5A5iq2ARLpPtF87lj8d9SKWYG' \
    --data-urlencode 'authenticated_userid=user100' \
    --data-urlencode 'response_type=token'
```

### [Client Credentials](https://www.rfc-editor.org/rfc/rfc6749#section-4.4)

```bash
  curl -k -i -X POST 'https://localhost:8000/authentication/oauth2/token' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'client_id=company1' \
    --data-urlencode 'client_secret=supersercet' \
    --data-urlencode 'grant_type=client_credentials' \
    --data-urlencode 'scope=api1/read'
```

## Authenticate API services

Enable OAuth 2.0 plugin to `api1` and `api2`

```bash
curl -k -i -X POST https://localhost:8001/services/api1/plugins \
    --data "name=oauth2"  \
    --data "config.enable_authorization_code=true" \
    --data "config.global_credentials=true"

curl -k -i -X POST https://localhost:8001/services/api2/plugins \
    --data "name=oauth2"  \
    --data "config.enable_authorization_code=true" \
    --data "config.global_credentials=true"
```

Access `api1` and `api2` with an access token

```bash
curl -k -i --header "Authorization: Bearer xMN40H2cz6m6AE6n8D6ZItKAHRcLkYqb" \
    -X GET https://localhost:8000/api1/anything

curl -k -i --header "Authorization: Bearer xMN40H2cz6m6AE6n8D6ZItKAHRcLkYqb" \
    -X GET https://localhost:8000/api2/anything
```
