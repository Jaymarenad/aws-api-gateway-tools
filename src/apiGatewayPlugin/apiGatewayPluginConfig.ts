/**
 * Requirements addressed:
 * - Support safe plugin defaults from get-dotenv config under `plugins['aws/api-gateway']`.
 * - CLI flags override config defaults.
 */

import { z } from '@karmaniverous/get-dotenv/cliHost';

export const apiGatewayPluginConfigSchema = z.object({
  /** Default REST API id (supports $VAR expansion at action time). */
  apiId: z.string().optional(),
  /** Default REST API name (supports $VAR expansion at action time). */
  apiName: z.string().optional(),
  /** Default stage name (supports $VAR expansion at action time). */
  stageName: z.string().optional(),
  /** Default template extension used by pull-keys when target file is missing. */
  templateExtension: z.string().optional(),
  flushCache: z
    .object({
      apiId: z.string().optional(),
      apiName: z.string().optional(),
      stageName: z.string().optional(),
    })
    .optional(),
  pullKeys: z
    .object({
      keyNames: z.array(z.string()).optional(),
      variableName: z.string().optional(),
      delimiter: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
});

export type ApiGatewayPluginConfig = z.output<
  typeof apiGatewayPluginConfigSchema
>;
