# AWS Secrets Manager Tools

[![npm version](https://img.shields.io/npm/v/@karmaniverous/aws-api-gateway-tools.svg)](https://www.npmjs.com/package/@karmaniverous/aws-api-gateway-tools) ![Node Current](https://img.shields.io/node/v/@karmaniverous/aws-api-gateway-tools) [![docs](https://img.shields.io/badge/docs-website-blue)](https://docs.karmanivero.us/aws-api-gateway-tools) [![changelog](https://img.shields.io/badge/changelog-latest-blue.svg)](./CHANGELOG.md) [![license](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](./LICENSE)

Tools and a get-dotenv plugin for working with AWS Secrets Manager “env-map” secrets (JSON object maps of environment variables).

This package provides:

- A tools-style wrapper that owns AWS client setup (including optional AWS X-Ray capture):
  - `AwsSecretsManagerTools`
- A get-dotenv plugin intended to be mounted under `aws`:
  - `secretsPlugin()` → `aws secrets pull|push|delete`
- A CLI embedding get-dotenv with the secrets plugin:
  - `aws-api-gateway-tools`

## Documentation

- Learn the programmatic API: [AwsSecretsManagerTools guide](guides/aws-api-gateway-tools.md)
- Learn the CLI and plugin behavior: [aws api-gateway plugin guide](guides/api-gateway-plugin.md)
- Browse the generated API reference: [TypeDoc site](https://docs.karmanivero.us/aws-api-gateway-tools)

## Install

```bash
npm i @karmaniverous/aws-api-gateway-tools
```

This package is ESM-only (Node >= 20).

## Quick start (programmatic)

```ts
import { AwsSecretsManagerTools } from '@karmaniverous/aws-api-gateway-tools';

const tools = new AwsSecretsManagerTools({
  clientConfig: { region: 'us-east-1', logger: console },
  xray: 'auto',
});

const current = await tools.readEnvSecret({ secretId: 'my-app/dev' });
await tools.upsertEnvSecret({ secretId: 'my-app/dev', value: current });
```

When you need AWS functionality not wrapped by this package, use the fully configured AWS SDK v3 client at `tools.client` (see the [programmatic guide](guides/aws-api-gateway-tools.md) for examples).

## Quick start (CLI)

```bash
aws-api-gateway-tools --env dev aws secrets pull --secret-name '$STACK_NAME'
aws-api-gateway-tools --env dev aws secrets push --secret-name '$STACK_NAME'
aws-api-gateway-tools --env dev aws secrets delete --secret-name '$STACK_NAME'
```

Notes:

- `--env` is a root-level (get-dotenv) option and must appear before the command path.
- Secret name expansion is evaluated at action time against `{ ...process.env, ...ctx.dotenv }` (ctx wins).

## Env-map secret format

Secrets are stored as a JSON object map of environment variables in `SecretString`:

```json
{ "KEY": "value", "OPTIONAL": null }
```

Notes:

- Values must be strings or `null`.
- `null` is treated as `undefined` when decoding.

## AWS X-Ray capture (optional)

X-Ray support is guarded:

- Default behavior is `xray: 'auto'`: capture is enabled only when `AWS_XRAY_DAEMON_ADDRESS` is set.
- To enable capture, install the optional peer dependency:
  - `aws-xray-sdk`
- In `auto` mode, if `AWS_XRAY_DAEMON_ADDRESS` is set but `aws-xray-sdk` is not installed, construction throws.

## Config defaults (getdotenv.config.\*)

If you embed the plugin in your own get-dotenv host (or use the shipped CLI), you can provide safe defaults in config under `plugins['aws/secrets']`:

```jsonc
{
  "plugins": {
    "aws/secrets": {
      "secretName": "$STACK_NAME",
      "templateExtension": "template",
      "push": { "from": ["file:env:private"] },
      "pull": { "to": "env:private" },
    },
  },
}
```

See the [api-gateway plugin guide](guides/api-gateway-plugin.md) for supported config keys and CLI behavior.

---

Built for you with ❤️ on Bali! Find more great tools & templates on [my GitHub Profile](https://github.com/karmaniverous).
