# 57577

## local development

```bash
yarn build
yarn dev
```

## functions

[#create-a-function](https://developers.cloudflare.com/pages/functions/get-started/#create-a-function)

> Writing your Functions files in the `/functions` directory will automatically generate a Worker with custom functionality at predesignated routes.

### Routing

[Routing](https://developers.cloudflare.com/pages/functions/routing/)

## wrangler

### migration

#### local

```bash
npx wrangler d1 migrations list 57577
npx wrangler d1 migrations apply 57577
```

#### remote

```bash
npx wrangler d1 migrations apply --remote 57577
```

#### delete migration history

```bash
npx wrangler d1 execute 57577 --command "DELETE FROM d1_migrations;"
```

## ngrok

We will need to use ngrok to test webhooks in our local environment.

```bash
ngrok http 8788
```
