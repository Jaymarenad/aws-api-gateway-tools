/**
 * Requirements addressed:
 * - Resolve REST API id by name for flush-cache when --api-id is not provided.
 * - Error when missing or ambiguous.
 */

import type { ApiGatewayPort } from '../ports/apiGatewayPort';
import { findUniqueByName } from './findUniqueByName';

export const resolveRestApiIdByName = async (
  port: ApiGatewayPort,
  apiName: string,
): Promise<string> => {
  const apis = await port.listRestApis({ limit: 500 });
  const api = findUniqueByName({
    items: apis,
    name: apiName,
    label: 'REST API',
  });

  if (!api.id) {
    throw new Error(`Unable to resolve REST API id for '${apiName}'.`);
  }

  return api.id;
};
