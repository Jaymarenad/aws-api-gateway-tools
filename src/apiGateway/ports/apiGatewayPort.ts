/**
 * Requirements addressed:
 * - Keep API Gateway core logic testable without AWS by defining a small port.
 * - Services depend on this port; AwsApiGatewayTools implements it using AWS SDK v3.
 */

/**
 * Minimal REST API descriptor (subset of AWS API Gateway fields).
 */
export type RestApiSummary = {
  /** REST API id. */
  id?: string;
  /** REST API name. */
  name?: string;
};

/**
 * Minimal API key descriptor (subset of AWS API Gateway fields).
 */
export type ApiKeySummary = {
  /** API key id. */
  id?: string;
  /** API key name. */
  name?: string;
  /** API key value (present only when `includeValues: true`). */
  value?: string;
};

/**
 * Small, testable port for the API Gateway operations used by this repo.
 *
 * Implementations may paginate internally and return full arrays.
 */
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
