/**
 * Requirements addressed:
 * - Keep API Gateway core logic testable without AWS by defining a small port.
 * - Services depend on this port; AwsApiGatewayTools implements it using AWS SDK v3.
 */

export type RestApiSummary = {
  id?: string;
  name?: string;
};

export type ApiKeySummary = {
  id?: string;
  name?: string;
  value?: string;
};

export type ApiGatewayPort = {
  /**
   * List REST APIs. Implementations should return all items (paginate internally).
   */
  listRestApis(opts?: { limit?: number }): Promise<RestApiSummary[]>;
  /**
   * Flush the cache for a specific REST API stage.
   */
  flushStageCache(opts: {
    restApiId: string;
    stageName: string;
  }): Promise<void>;
  /**
   * List API keys matching a name query, including values.
   * Implementations should return all items (paginate internally).
   */
  listApiKeys(opts: {
    nameQuery: string;
    includeValues: boolean;
    limit?: number;
  }): Promise<ApiKeySummary[]>;
};
