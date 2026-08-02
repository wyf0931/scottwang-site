# Local operations and deployment

## Local server

`bin/ops.sh` is the single local process entry point. It stores the background Next.js process ID and log under `.runtime/`, which is ignored by Git.

```bash
./bin/ops.sh start
./bin/ops.sh status
./bin/ops.sh restart
./bin/ops.sh stop
```

The default port is `3000`; override it with `PORT=3100 ./bin/ops.sh start`.

## Local production deployment

The `deploy` command runs all release checks before invoking Vercel CLI:

```bash
export VERCEL_TOKEN="..."
./bin/ops.sh deploy
```

`VERCEL_SCOPE` is optional for team-scoped projects. Secrets must never be committed.

## GitHub deployment

`.github/workflows/deploy.yml` deploys `main` to Vercel. Repository secrets required:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Pull requests use the CI workflow for verification. Production deployment is restricted to the `main` branch or a manual workflow dispatch.
