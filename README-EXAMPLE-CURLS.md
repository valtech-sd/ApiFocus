# CURL Calls for the Example API

Below are CURL calls you can make to connect to a running API using the provided example.

## Ping

Accesses the root endpoint (GET /) which is just a PING to verify the server is up.

```bash
curl --location --request GET 'http://localhost:8000/'
```

## Echo

Accesses the POST /echo endpoint, passing a message, which is returned back the client.

```bash
curl --location --request POST 'http://localhost:8000/echo' \
--header 'Content-Type: application/json' \
--data-raw '{
  "echoMessage": "Hi there.",
  "outputTimestamp": true
}'
```

## Echo Secured

Accesses the POST /echo_secured endpoint passing an ApiKey. Other than requiring an apikey header, this endpoint does the same as /echo.

```bash
curl --location --request POST 'http://localhost:8000/echo_secured' \
--header 'apikey: abc123' \
--header 'Content-Type: application/json' \
--data-raw '{
  "echoMessage": "Hi there.",
  "outputTimestamp": true
}'
```