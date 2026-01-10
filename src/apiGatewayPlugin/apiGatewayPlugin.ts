/**
 * Requirements addressed:
 * - Provide get-dotenv plugin mounted as `aws api-gateway` with commands:
 *   - `aws api-gateway flush-cache`
 *   - `aws api-gateway pull-keys`
 * - Keep the plugin adapter thin: command registration is decomposed into
 *   dedicated modules; core behavior lives outside this file.
 */

import { definePlugin } from '@karmaniverous/get-dotenv/cliHost';

import { apiGatewayPluginConfigSchema } from './apiGatewayPluginConfig';
import { registerFlushCacheCommand } from './commands/registerFlushCacheCommand';
import { registerPullKeysCommand } from './commands/registerPullKeysCommand';

/**
 * get-dotenv plugin that provides `aws api-gateway flush-cache|pull-keys`.
 *
 * Intended usage: mount under `awsPlugin().use(apiGatewayPlugin())`.
 */
export const apiGatewayPlugin = () => {
  const plugin = definePlugin({
    ns: 'api-gateway',
    configSchema: apiGatewayPluginConfigSchema,
    setup(cli) {
      cli.description('AWS API Gateway helpers (REST APIs).');
      registerFlushCacheCommand({ cli, plugin });
      registerPullKeysCommand({ cli, plugin });
    },
  });

  return plugin;
};
