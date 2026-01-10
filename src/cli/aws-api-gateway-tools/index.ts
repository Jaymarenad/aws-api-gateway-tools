/**
 * Requirements addressed:
 * - Replace sample CLI with a get-dotenv CLI alias `aws-api-gateway-tools`.
 * - Duplicate default get-dotenv CLI composition, but omit awsWhoamiPlugin.
 * - Mount api-gateway plugin under aws: `awsPlugin().use(apiGatewayPlugin())`.
 */

import { createCli } from '@karmaniverous/get-dotenv/cli';
import {
  awsPlugin,
  batchPlugin,
  cmdPlugin,
  initPlugin,
} from '@karmaniverous/get-dotenv/plugins';

import { apiGatewayPlugin } from '../../apiGatewayPlugin/apiGatewayPlugin';

await createCli({
  alias: 'aws-api-gateway-tools',
  compose: (program) =>
    program
      .use(
        cmdPlugin({ asDefault: true, optionAlias: '-c, --cmd <command...>' }),
      )
      .use(batchPlugin())
      .use(awsPlugin().use(apiGatewayPlugin()))
      .use(initPlugin()),
})();
