# poc-kong-oauth

## Kong admin UI

1. Open http://localhost:1337 for the Admin UI (using [Konga](https://github.com/pantsel/konga))
2. It will prompt for username, email and password. Then "Create Admin"
3. It will ask for Kong Admin URL (which is a [Kong Admin API](https://docs.konghq.com/gateway/latest/admin-api/)), in this case, use `http://kong-gateway:8001`

## Prepare environments

### Start the Kong API Gateway

```bash
docker-compose up --build
```

You might find an error for the first start due to the PG database is not ready for migration yet. Please retry by `control+c` and `docker-compose up` again
