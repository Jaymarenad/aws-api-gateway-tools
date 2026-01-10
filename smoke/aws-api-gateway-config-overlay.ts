/**
 * Requirements addressed:
 * - Provide an opt-in end-to-end smoke test that hits real AWS resources.
 * - Exercise getdotenv config overlay discovery (rootOptionDefaults + plugins.aws).
 * - Exercise:
 *   - `aws api-gateway flush-cache`
 *   - `aws api-gateway pull-keys` with template bootstrap into a dotenv file
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import type { ProcessEnv } from '@karmaniverous/get-dotenv';

import {
  assertContains,
  assertSmokeFixturesPresent,
  expectCommandOk,
  fileExists,
  findRepoRoot,
  getApiKeyNames,
  getAwsApiGatewayFixturePaths,
  getFlushCacheSelector,
  loadSmokeEnv,
  logCommandOk,
  mkdirp,
  readText,
  rmrf,
  runAwsApiGatewayToolsCli,
  shouldKeepArtifacts,
  shouldRunApiGatewaySmoke,
  SMOKE_OVERLAY_CONFIG_FIXTURE_REL,
  SMOKE_TEMPLATE_SENTINEL,
} from './smokeLib';

const listRootConfigs = async (repoRoot: string): Promise<string[]> => {
  const names = await fs.readdir(repoRoot);
  return names.filter(
    (n) =>
      n.startsWith('getdotenv.config.') ||
      n.startsWith('getdotenv.config.local.'),
  );
};

const withConfigOverlay = async <T>(
  repoRoot: string,
  smokeEnv: ProcessEnv,
  fn: () => Promise<T>,
): Promise<T> => {
  const runId = `${String(Date.now())}-${Math.random().toString(16).slice(2)}`;
  const backupRoot = path.resolve(repoRoot, '.smoke-backup');
  const backupDir = path.resolve(backupRoot, runId);
  await mkdirp(backupDir);

  const moved: Array<{ from: string; to: string }> = [];
  const configPath = path.resolve(repoRoot, 'getdotenv.config.json');

  try {
    const existing = await listRootConfigs(repoRoot);
    for (const name of existing) {
      const from = path.resolve(repoRoot, name);
      const to = path.resolve(backupDir, name);
      await fs.rename(from, to);
      moved.push({ from, to });
    }

    const fixturePath = path.resolve(
      repoRoot,
      SMOKE_OVERLAY_CONFIG_FIXTURE_REL,
    );
    await fs.copyFile(fixturePath, configPath);

    return await fn();
  } finally {
    if (await fileExists(configPath)) {
      await rmrf(configPath);
    }
    for (const m of moved) {
      if (!(await fileExists(m.from))) {
        await fs.rename(m.to, m.from);
      }
    }
    await rmrf(backupDir);

    try {
      const remaining = await fs.readdir(backupRoot);
      if (!remaining.length) await fs.rmdir(backupRoot);
    } catch {
      // ignore
    }
  }
};

const main = async (): Promise<void> => {
  console.log('smoke:overlay: starting...');

  const repoRoot = await findRepoRoot(process.cwd());
  const smokeEnv = await loadSmokeEnv(repoRoot);
  if (!shouldRunApiGatewaySmoke(smokeEnv)) {
    console.log('smoke:overlay: skipped (set SMOKE_APIGW=1 to enable).');
    return;
  }

  const keepArtifacts = shouldKeepArtifacts(smokeEnv);
  const { apiId, apiName, stageName } = getFlushCacheSelector(smokeEnv);
  const keyNames = getApiKeyNames(smokeEnv);

  console.log(
    `smoke:overlay: stage=${stageName} apiId=${apiId ?? ''} apiName=${apiName ?? ''} keys=${String(keyNames.length)}`,
  );

  await assertSmokeFixturesPresent({ repoRoot });
  const fixtures = getAwsApiGatewayFixturePaths({ repoRoot });

  try {
    await rmrf(fixtures.localAbs);

    await withConfigOverlay(repoRoot, smokeEnv, async () => {
      const flushRes = await runAwsApiGatewayToolsCli({
        repoRoot,
        env: smokeEnv,
        argv: ['aws', 'api-gateway', 'flush-cache'],
      });
      expectCommandOk(flushRes, 'config-overlay: flush-cache');
      logCommandOk(flushRes, 'config-overlay: flush-cache');

      const pullRes = await runAwsApiGatewayToolsCli({
        repoRoot,
        env: smokeEnv,
        argv: [
          'aws',
          'api-gateway',
          'pull-keys',
          '--key-names',
          ...keyNames,
          '--to',
          'global:private',
        ],
      });
      expectCommandOk(pullRes, 'config-overlay: pull-keys');
      logCommandOk(pullRes, 'config-overlay: pull-keys');

      const localText = await readText(fixtures.localAbs);
      assertContains(
        localText,
        SMOKE_TEMPLATE_SENTINEL,
        'expected .env.local to be bootstrapped from template and preserve comments',
      );
      assertContains(localText, 'API_KEYS=', 'expected API_KEYS to be present');
    });
  } finally {
    if (!keepArtifacts) await rmrf(fixtures.localAbs);
  }

  console.log('smoke:overlay: done.');
};

await main();
