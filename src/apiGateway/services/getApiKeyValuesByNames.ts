/**
 * Requirements addressed:
 * - pull-keys accepts a space-delimited list of key names and retrieves all values.
 * - Missing or ambiguous keys fail the whole operation.
 * - Preserve user-provided ordering.
 */

import type { ApiGatewayPort } from '../ports/apiGatewayPort';
import { getApiKeyValueByName } from './getApiKeyValueByName';

export const getApiKeyValuesByNames = async (
  port: ApiGatewayPort,
  keyNames: string[],
): Promise<string[]> => {
  const values: string[] = [];
  for (const name of keyNames) {
    values.push(await getApiKeyValueByName(port, name));
  }
  return values;
};
