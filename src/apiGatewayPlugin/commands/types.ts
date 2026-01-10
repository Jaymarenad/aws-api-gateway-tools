/**
 * Requirements addressed:
 * - Use get-dotenv public types end-to-end (no casts) for command wiring:
 *   - CLI mount type (GetDotenvCliPublic)
 *   - Plugin instance type (PluginWithInstanceHelpers with schema-inferred config)
 */

import type { GetDotenvOptions } from '@karmaniverous/get-dotenv';
import type {
  GetDotenvCliPublic,
  PluginWithInstanceHelpers,
} from '@karmaniverous/get-dotenv/cliHost';

import type { ApiGatewayPluginConfig } from '../apiGatewayPluginConfig';

export type ApiGatewayPluginCli = GetDotenvCliPublic<GetDotenvOptions>;
export type ApiGatewayPluginApi = PluginWithInstanceHelpers<
  GetDotenvOptions,
  ApiGatewayPluginConfig
>;
