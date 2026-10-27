import test from 'node:test';
import assert from 'node:assert/strict';
import { yaml } from './helpers.mjs';

test('automatic checks cannot deploy and production publication remains manual', () => {
  const checks = yaml('.github/workflows/check.yml');
  assert(Object.hasOwn(checks.on, 'pull_request'));
  assert(Object.hasOwn(checks.on, 'push'));
  assert.deepEqual(checks.permissions, { contents: 'read' });
  for (const job of Object.values(checks.jobs)) {
    assert(!job.environment, 'Automatic checks must not use the production environment');
    assert(!job.steps.some(step => step.uses?.startsWith('actions/deploy-pages@')));
  }
  const deploy = yaml('.github/workflows/deploy.yml');
  assert.deepEqual(Object.keys(deploy.on), ['workflow_dispatch']);
  assert.deepEqual(deploy.permissions, {});
  assert.equal(deploy.concurrency['cancel-in-progress'], false);
  for (const name of ['build', 'deploy']) assert.equal(deploy.jobs[name].if, "github.ref == 'refs/heads/main'");
  const build = deploy.jobs.build;
  assert.equal(build.permissions.contents, 'read');
  assert.notEqual(build.permissions.pages, 'write');
  const buildIndex = build.steps.findIndex(step => step.run === 'npm run build');
  const testIndex = build.steps.findIndex(step => step.run === 'npm test');
  const uploadIndex = build.steps.findIndex(step => step.uses?.startsWith('actions/upload-pages-artifact@'));
  assert(buildIndex >= 0 && testIndex > buildIndex && uploadIndex > testIndex);
  assert.equal(build.steps[uploadIndex].with.path, 'dist');
  assert.equal(deploy.jobs.deploy.needs, 'build');
  assert.equal(deploy.jobs.deploy.environment.name, 'github-pages');
  assert.deepEqual(deploy.jobs.deploy.permissions, { pages: 'write', 'id-token': 'write' });
  for (const job of [checks.jobs.check, build]) {
      const checkout = job.steps.find(step => step.uses?.startsWith('actions/checkout@'));
      assert.equal(checkout?.with?.lfs, true, 'Builds must download real LFS assets');
    }
    // Required reviewers are repository settings and cannot be verified from workflow YAML.
});
