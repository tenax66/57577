# 57577

## License

The source code to display the content is distributed under the MIT License.  
The license does not apply to the content itself.

## Getting Started

```bash
yarn build
yarn dev
```

## Cheatsheet

### Functions

[#create-a-function](https://developers.cloudflare.com/pages/functions/get-started/#create-a-function)

> Writing your Functions files in the `/functions` directory will automatically generate a Worker with custom functionality at predesignated routes.

#### Routing

[Routing](https://developers.cloudflare.com/pages/functions/routing/)

### wrangler

#### migration

```bash
# local
npx wrangler d1 migrations list --local 57577
npx wrangler d1 migrations apply --local 57577

# remote
npx wrangler d1 migrations list --remote 57577
npx wrangler d1 migrations apply --remote 57577
```

#### migration history

```bash
# local
npx wrangler d1 execute 57577 --local --command "SELECT * FROM d1_migrations;"
npx wrangler d1 execute 57577 --local --command "DELETE FROM d1_migrations WHERE id = ?;"

# remote
npx wrangler d1 execute 57577 --remote --command "SELECT * FROM d1_migrations;"
npx wrangler d1 execute 57577 --remote --command "DELETE FROM d1_migrations WHERE id = ?;"
```

#### tables list

```bash
npx wrangler d1 execute 57577 --local --command "select name from sqlite_master where type='table';"
```

### ngrok

We will need to use ngrok to test webhooks in our local environment.

```bash
ngrok http 8788
```

### indexing

[fts5](https://runebook.dev/ja/docs/sqlite/fts5)

[sqlite-fts-contains-and-suffix-matches](https://blog.kapeli.com/sqlite-fts-contains-and-suffix-matches)

### 利用規約

[汎用的な利用規約のひな型](https://kiyaku.jp/hinagata/gp.html)
