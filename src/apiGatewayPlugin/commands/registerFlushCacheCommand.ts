/**
 * Requirements addressed:
 * - Provide `aws api-gateway flush-cache`.
 * - Support:
 *   - `--api-id <string>` (fallback: `$API_ID`)
 *   - `--api-name <string>` (fallback: `$API_NAME`)
 *   - `--stage-name <string>` (fallback: `$STAGE_NAME`)
 * - `--api-id` conflicts with `--api-name`.
 * - Expand flag values at action time against `{ ...process.env, ...ctx.dotenv }` (ctx wins).
 * - Region is sourced from aws plugin context.
 * - Keep adapter thin: delegate AWS operations to AwsApiGatewayTools.
 */

import {
  buildSpawnEnv,
  dotenvExpand,
  silentLogger,
} from '@karmaniverous/get-dotenv';
import { readMergedOptions } from '@karmaniverous/get-dotenv/cliHost';
import { getAwsRegion } from '@karmaniverous/get-dotenv/plugins/aws';

import { AwsApiGatewayTools } from '../../apiGateway/AwsApiGatewayTools';
import type { ApiGatewayPluginApi, ApiGatewayPluginCli } from './types';

export const registerFlushCacheCommand = ({
  cli,
  plugin,
}: {
  cli: ApiGatewayPluginCli;
  plugin: ApiGatewayPluginApi;
}): void => {
  const flush = cli
    .ns('flush-cache')
    .description('Flush a REST API stage cache.');

  flush
    .addOption(
      plugin
        .createPluginDynamicOption(
          flush,
          '--api-id <string>',
          (_helpCfg, cfg) => {
            const def = cfg.flushCache?.apiId ?? cfg.apiId ?? '$API_ID';
            return `REST API id (supports $VAR expansion) (default: ${def})`;
          },
        )
        .conflicts('apiName'),
    )
    .addOption(
      plugin
        .createPluginDynamicOption(
          flush,
          '--api-name <string>',
          (_helpCfg, cfg) => {
            const def = cfg.flushCache?.apiName ?? cfg.apiName ?? '$API_NAME';
            return `REST API name (supports $VAR expansion) (default: ${def})`;
          },
        )
        .conflicts('apiId'),
    )
    .addOption(
      plugin.createPluginDynamicOption(
        flush,
        '--stage-name <string>',
        (_helpCfg, cfg) => {
          const def =
            cfg.flushCache?.stageName ?? cfg.stageName ?? '$STAGE_NAME';
          return `stage name (supports $VAR expansion) (default: ${def})`;
        },
      ),
    )
    .action(async (opts) => {
      const ctx = cli.getCtx();
      const cfg = plugin.readConfig(flush);

      const bag = readMergedOptions(flush);
      const sdkLogger = bag.debug ? console : silentLogger;

      const envRef = buildSpawnEnv(process.env, ctx.dotenv);

      const stageNameRaw =
        opts.stageName ??
        cfg.flushCache?.stageName ??
        cfg.stageName ??
        '$STAGE_NAME';
      const stageName = dotenvExpand(stageNameRaw, envRef);
      if (!stageName) throw new Error('stage-name is required.');

      const region = getAwsRegion(ctx);
      const tools = new AwsApiGatewayTools({
        clientConfig: region
          ? { region, logger: sdkLogger }
          : { logger: sdkLogger },
      });

      // Prefer api-id if it resolves; otherwise fall back to api-name.
      const apiIdRaw =
        opts.apiId ?? cfg.flushCache?.apiId ?? cfg.apiId ?? '$API_ID';
      const apiId = dotenvExpand(apiIdRaw, envRef);

      if (apiId) {
        console.info(`Flushing API Gateway cache for apiId '${apiId}'...`);
        await tools.flushStageCache({ restApiId: apiId, stageName });
        console.info('Done.');
        return;
      }

      const apiNameRaw =
        opts.apiName ?? cfg.flushCache?.apiName ?? cfg.apiName ?? '$API_NAME';
      const apiName = dotenvExpand(apiNameRaw, envRef);
      if (!apiName) {
        throw new Error(
          'api-id or api-name is required (via flags or env/config).',
        );
      }

      console.info(`Flushing API Gateway cache for '${apiName}'...`);
      const { apiId: resolved } = await tools.flushStageCacheByName({
        apiName,
        stageName,
      });
      console.info(`Done. (apiId=${resolved})`);
    });
};
