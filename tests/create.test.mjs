import { afterEach, expect, test } from 'vite-plus/test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createProject } from '../generator/src/create.mjs'

const temporary = []
function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vp-create-test-'))
  temporary.push(root)
  const templates = path.join(root, 'templates')
  const source = path.join(templates, 'vue3-ts')
  mkdirSync(source, { recursive: true })
  writeFileSync(
    path.join(source, 'package.json'),
    JSON.stringify({ name: 'template', scripts: { dev: 'vp dev' } }),
  )
  return { root, source, templates, directory: path.join(root, 'My App') }
}
afterEach(() => {
  for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true })
})

test('创建工程时生成有效包名并保留模板配置', () => {
  const options = fixture()
  createProject({ ...options, template: 'vue3-ts' })
  const pkg = JSON.parse(readFileSync(path.join(options.directory, 'package.json'), 'utf8'))
  expect(pkg).toEqual({ name: 'my-app', scripts: { dev: 'vp dev' } })
})

test('修改唯一模板源码后下次创建立即生效', () => {
  const options = fixture()
  writeFileSync(path.join(options.source, 'message.txt'), '新内容')
  createProject({ ...options, template: 'vue3-ts' })
  expect(readFileSync(path.join(options.directory, 'message.txt'), 'utf8')).toBe('新内容')
})

test('拒绝覆盖已有文件并保留原内容', () => {
  const options = fixture()
  mkdirSync(options.directory)
  writeFileSync(path.join(options.directory, 'keep.txt'), '保留')
  expect(() => createProject({ ...options, template: 'vue3-ts' })).toThrow('目标目录非空')
  expect(readFileSync(path.join(options.directory, 'keep.txt'), 'utf8')).toBe('保留')
})

test('拒绝写入其他模板目录和模板父目录', () => {
  const options = fixture()
  for (const directory of [path.join(options.templates, 'monorepo'), options.root]) {
    expect(() => createProject({ ...options, template: 'vue3-ts', directory })).toThrow(
      '目标目录不能',
    )
  }
})

test('过滤开发产物但保留模板源码和环境默认值', () => {
  const options = fixture()
  for (const name of ['node_modules', '.git', 'dist', 'coverage', '.artifacts', '.husky/_']) {
    mkdirSync(path.join(options.source, name), { recursive: true })
    writeFileSync(path.join(options.source, name, 'artifact'), '忽略')
  }
  for (const name of ['.env', '.env.local', '.cspellcache', 'pnpm-lock.template'])
    writeFileSync(path.join(options.source, name), '内容')
  createProject({ ...options, template: 'vue3-ts' })
  for (const name of [
    'node_modules',
    '.git',
    'dist',
    'coverage',
    '.artifacts',
    '.env.local',
    '.cspellcache',
    '.husky/_',
    'pnpm-lock.template',
  ])
    expect(existsSync(path.join(options.directory, name))).toBe(false)
  expect(readFileSync(path.join(options.directory, '.env'), 'utf8')).toBe('内容')
  expect(readFileSync(path.join(options.directory, 'pnpm-lock.yaml'), 'utf8')).toBe('内容')
})

test('无效模板清单不会创建半成品', () => {
  const options = fixture()
  writeFileSync(path.join(options.source, 'package.json'), '{')
  expect(() => createProject({ ...options, template: 'vue3-ts' })).toThrow()
  expect(existsSync(options.directory)).toBe(false)
})

test('CLI 帮助成功退出，缺少参数时给出简洁错误', () => {
  const cli = fileURLToPath(new URL('../generator/bin/create.mjs', import.meta.url))
  expect(execFileSync(process.execPath, [cli, '--help'], { encoding: 'utf8' })).toContain(
    '--template',
  )
  const result = spawnSync(process.execPath, [cli], { encoding: 'utf8' })
  expect(result.status).toBe(1)
  expect(result.stderr).toContain('请传入')
  expect(result.stderr).not.toContain('at file:')
})

test('允许在空目录创建工程', () => {
  const options = fixture()
  mkdirSync(options.directory)
  createProject({ ...options, template: 'vue3-ts' })
  expect(existsSync(path.join(options.directory, 'package.json'))).toBe(true)
})

test('无效模板名称和纯中文目录不会留下半成品', () => {
  const options = fixture()
  expect(() => createProject({ ...options, template: 'unknown' })).toThrow('请传入')
  expect(() =>
    createProject({ ...options, template: 'vue3-ts', directory: path.join(options.root, '测试') }),
  ).toThrow('目录名')
  expect(existsSync(options.directory)).toBe(false)
})
