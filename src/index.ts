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

export {
  AwsApiGatewayTools,
  type AwsApiGatewayToolsOptions,
} from './apiGateway/AwsApiGatewayTools';
export { apiGatewayPlugin } from './apiGatewayPlugin/apiGatewayPlugin';
