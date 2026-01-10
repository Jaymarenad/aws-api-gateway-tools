# AWS API Gateway Tools

[![npm version](https://img.shields.io/npm/v/@karmaniverous/aws-api-gateway-tools.svg)](https://www.npmjs.com/package/@karmaniverous/aws-api-gateway-tools) ![Node Current](https://img.shields.io/node/v/@karmaniverous/aws-api-gateway-tools) [![docs](https://img.shields.io/badge/docs-website-blue)](https://docs.karmanivero.us/aws-api-gateway-tools) [![changelog](https://img.shields.io/badge/changelog-latest-blue.svg)](./CHANGELOG.md) [![license](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](./LICENSE)

Tools and a get-dotenv plugin for working with AWS API Gateway (REST APIs), including stage cache flush and API key retrieval.

This package provides:

- A tools-style wrapper that owns AWS client setup (including optional AWS X-Ray capture):
  - `AwsApiGatewayTools`
- A get-dotenv plugin intended to be mounted under `aws`:
  - `apiGatewayPlugin()` → `aws api-gateway flush-cache|pull-keys`
- A CLI embedding get-dotenv with the api-gateway plugin:
  - `aws-api-gateway-tools`

## Documentation

- Learn the programmatic API: [AwsApiGatewayTools guide](guides/aws-api-gateway-tools.md)
- Learn the CLI and plugin behavior: [aws api-gateway plugin guide](guides/api-gateway-plugin.md)
- Browse the generated API reference: [TypeDoc site](https://docs.karmanivero.us/aws-api-gateway-tools)

## Install

```bash
npm i @karmaniverous/aws-api-gateway-tools
```

This package is ESM-only (Node >= 20).

## Quick start (programmatic)

```ts
import { AwsApiGatewayTools } from '@karmaniverous/aws-api-gateway-tools';

const tools = new AwsApiGatewayTools({
  clientConfig: { region: 'us-east-1', logger: console },
  xray: 'auto',
});

await tools.flushStageCache({ restApiId: 'abc123', stageName: 'dev' });
```

When you need AWS functionality not wrapped by this package, use the fully configured AWS SDK v3 client at `tools.client` (see the [programmatic guide](guides/aws-api-gateway-tools.md) for examples).

## Quick start (CLI)

```bash
aws-api-gateway-tools aws api-gateway flush-cache
aws-api-gateway-tools aws api-gateway pull-keys --key-names '$API_KEY_A' '$API_KEY_B'
```

Notes:

- Relevant flags support `$VAR` expansion evaluated at action time against `{ ...process.env, ...ctx.dotenv }` (`ctx.dotenv` wins).

## AWS X-Ray capture (optional)

X-Ray support is guarded:

- Default behavior is `xray: 'auto'`: capture is enabled only when `AWS_XRAY_DAEMON_ADDRESS` is set.
- To enable capture, install the optional peer dependency:
  - `aws-xray-sdk`
- In `auto` mode, if `AWS_XRAY_DAEMON_ADDRESS` is set but `aws-xray-sdk` is not installed, construction throws.

## Config defaults (getdotenv.config.\*)

If you embed the plugin in your own get-dotenv host (or use the shipped CLI), you can provide safe defaults in config under `plugins['aws/api-gateway']`:

```jsonc
{
  "plugins": {
    "aws/api-gateway": {
      "apiId": "$API_ID",
      "apiName": "$API_NAME",
      "stageName": "$STAGE_NAME",
      "templateExtension": "template",
      "pullKeys": { "to": "env:private", "delimiter": ", " }
    },
  },
}
```

See the [api-gateway plugin guide](guides/api-gateway-plugin.md) for supported config keys and CLI behavior.

---

Built for you with ❤️ on Bali! Find more great tools & templates on [my GitHub Profile](https://github.com/karmaniverous).
