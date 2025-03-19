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
npx wrangler d1 migrations list --local 57577
npx wrangler d1 migrations apply --local 57577
```

#### remote

```bash
npx wrangler d1 migrations apply --remote 57577
```

#### migration history

```bash
npx wrangler d1 execute 57577 --local --command "SELECT * FROM d1_migrations;"
npx wrangler d1 execute 57577 --local --command "DELETE FROM d1_migrations WHERE id = ?;"
```

#### tables list

```bash
npx wrangler d1 execute 57577 --local --command "select name from sqlite_master where type='table';"
```

## ngrok

We will need to use ngrok to test webhooks in our local environment.

```bash
ngrok http 8788
```

## indexing

[fts5](https://runebook.dev/ja/docs/sqlite/fts5)

[sqlite-fts-contains-and-suffix-matches](https://blog.kapeli.com/sqlite-fts-contains-and-suffix-matches)
