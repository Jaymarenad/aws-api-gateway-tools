/**
 * Requirements addressed:
 * - pull-keys must fail the whole command when any key is missing.
 * - Key selection: prefer exact name match; otherwise accept single match; else error.
 * - Require includeValues to retrieve key values.
 */

import type { ApiGatewayPort } from '../ports/apiGatewayPort';
import { findUniqueByName } from './findUniqueByName';

export const getApiKeyValueByName = async (
  port: ApiGatewayPort,
  keyName: string,
): Promise<string> => {
  const items = await port.listApiKeys({
    includeValues: true,
    nameQuery: keyName,
    limit: 500,
  });

  const key = findUniqueByName({ items, name: keyName, label: 'API key' });
  if (!key.value) {
    throw new Error(
      `API key '${keyName}' is missing a value (includeValues?).`,
    );
  }

  return key.value;
};
