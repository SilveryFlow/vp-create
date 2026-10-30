import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const temp = mkdtempSync(path.join(os.tmpdir(), 'vp-create-smoke-'))
const vp = process.platform === 'win32' ? 'vp.exe' : 'vp'
const run = (args, cwd) =>
  execFileSync(vp, args, { cwd, stdio: 'inherit', env: { ...process.env, VP_GIT_HOOKS: '0' } })
try {
  execFileSync('tar', ['-xzf', path.join(root, '.artifacts/create-vp-starter.tgz'), '-C', temp])
  const packaged = path.join(temp, 'package')
  const selected = process.argv[2] ? [process.argv[2]] : ['vue3-ts', 'monorepo']
  for (const template of selected) {
    if (!['vue3-ts', 'monorepo'].includes(template)) throw new Error('未知模板：' + template)
    const target = path.join(temp, template + '-app')
    execFileSync(
      process.execPath,
      [path.join(packaged, 'bin/create.mjs'), '--template', template, '--directory', target],
      { stdio: 'inherit' },
    )
    if (!existsSync(path.join(target, '.gitignore'))) throw new Error('缺少忽略规则')
    for (const name of ['node_modules', '.git', 'dist'])
      if (existsSync(path.join(target, name))) throw new Error('产物包含开发文件：' + name)
    if (!readFileSync(path.join(target, 'pnpm-lock.yaml'), 'utf8').includes('lockfileVersion:'))
      throw new Error('锁文件缺失')
    run(['install', '--frozen-lockfile'], target)
    for (const task of template === 'monorepo'
      ? ['build', 'verify', 'verify:hooks']
      : ['build', 'type-check', 'lint', 'test', 'format:check'])
      run(['run', task], target)
  }
} finally {
  // temp 来自系统 mkdtemp，测试结束只清理该目录。
  rmSync(temp, { recursive: true, force: true })
}
