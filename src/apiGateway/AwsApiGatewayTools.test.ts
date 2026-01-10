import {
  FlushStageCacheCommand,
  GetApiKeysCommand,
  GetRestApisCommand,
} from '@aws-sdk/client-api-gateway';
import { describe, expect, it, vi } from 'vitest';

import { AwsApiGatewayTools } from './AwsApiGatewayTools';

type SendableClient = { send: (cmd: unknown) => Promise<unknown> };
const spySend = (tools: AwsApiGatewayTools) =>
  vi.spyOn(tools.client as unknown as SendableClient, 'send');

describe('AwsApiGatewayTools', () => {
  it('flushes stage cache by id', async () => {
    const tools = new AwsApiGatewayTools({ xray: 'off' });
    const send = spySend(tools).mockResolvedValueOnce({});

    await expect(
      tools.flushStageCache({ restApiId: 'abc', stageName: 'dev' }),
    ).resolves.toBeUndefined();

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(FlushStageCacheCommand);
  });

  it('flushes stage cache by name (resolve id then flush)', async () => {
    const tools = new AwsApiGatewayTools({ xray: 'off' });
    const send = spySend(tools)
      .mockResolvedValueOnce({ items: [{ id: 'xyz', name: 'my-api' }] })
      .mockResolvedValueOnce({});

    await expect(
      tools.flushStageCacheByName({ apiName: 'my-api', stageName: 'dev' }),
    ).resolves.toEqual({ apiId: 'xyz' });

    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(GetRestApisCommand);
    expect(send.mock.calls[1]?.[0]).toBeInstanceOf(FlushStageCacheCommand);
  });

  it('retrieves API key values by names (preserve order)', async () => {
    const tools = new AwsApiGatewayTools({ xray: 'off' });
    const send = spySend(tools)
      .mockResolvedValueOnce({ items: [{ name: 'A', value: 'va' }] })
      .mockResolvedValueOnce({ items: [{ name: 'B', value: 'vb' }] });

    await expect(
      tools.getApiKeyValuesByNames({ keyNames: ['A', 'B'] }),
    ).resolves.toEqual(['va', 'vb']);

    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(GetApiKeysCommand);
    expect(send.mock.calls[1]?.[0]).toBeInstanceOf(GetApiKeysCommand);
  });
});
