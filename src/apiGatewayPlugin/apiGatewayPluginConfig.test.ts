import { describe, expect, it } from 'vitest';

import { apiGatewayPluginConfigSchema } from './apiGatewayPluginConfig';

describe('apiGatewayPluginConfig', () => {
  it('parses safe plugin config fields via schema', () => {
    const cfg = apiGatewayPluginConfigSchema.parse({
      apiId: '$API_ID',
      apiName: '$API_NAME',
      stageName: '$STAGE_NAME',
      templateExtension: 'template',
      pullKeys: {
        keyNames: ['a', 'b'],
        variableName: 'API_KEYS',
        delimiter: ', ',
        to: 'env:private',
      },
    });
    expect(cfg.apiId).toBe('$API_ID');
    expect(cfg.pullKeys?.delimiter).toBe(', ');
  });

  it('ignores unknown keys via schema (strip default)', () => {
    const cfg = apiGatewayPluginConfigSchema.parse({
      apiName: 'x',
      unknownKey: 'nope',
    });
    expect(Object.prototype.hasOwnProperty.call(cfg, 'unknownKey')).toBe(false);
  });
});
