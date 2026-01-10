/**
 * This is the main entry point for the library.
 *
 * @packageDocumentation
 */

/**
 * Requirements addressed:
 * - Export a public `AwsApiGatewayTools`.
 * - Export the get-dotenv `apiGatewayPlugin` for mounting under `aws`.
 */

export type { FlushStageCacheByNameResult } from './apiGateway/AwsApiGatewayTools';
export {
  AwsApiGatewayTools,
  type AwsApiGatewayToolsOptions,
} from './apiGateway/AwsApiGatewayTools';
export type {
  ApiGatewayPort,
  ApiKeySummary,
  RestApiSummary,
} from './apiGateway/ports/apiGatewayPort';
export { apiGatewayPlugin } from './apiGatewayPlugin/apiGatewayPlugin';
export {
  type ApiGatewayPluginConfig,
  apiGatewayPluginConfigSchema,
} from './apiGatewayPlugin/apiGatewayPluginConfig';
