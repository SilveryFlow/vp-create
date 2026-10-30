import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { includeFile } from '../generator/src/create.mjs'

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)))
const artifacts = path.join(root, '.artifacts')
const stage = path.join(artifacts, 'package')
// 清理范围固定为仓库自己的临时打包目录。
if (!stage.startsWith(root + path.sep)) throw new Error('打包路径越界')
rmSync(stage, { recursive: true, force: true })
mkdirSync(stage, { recursive: true })
const source = path.join(root, 'generator')
for (const entry of ['package.json', 'bin', 'src', 'templates'])
  cpSync(path.join(source, entry), path.join(stage, entry), {
    recursive: true,
    filter: (file) => includeFile(source, file),
  })
cpSync(path.join(root, 'README.md'), path.join(stage, 'README.md'))
for (const name of ['vue3-ts', 'monorepo']) {
  const dir = path.join(stage, 'templates', name)
  renameSync(path.join(dir, '.gitignore'), path.join(dir, '_gitignore'))
}
// npm 不会收录 pnpm-lock.yaml，归档时换名，创建时恢复。
for (const name of ['vue3-ts', 'monorepo']) {
  const dir = path.join(stage, 'templates', name)
  if (!existsSync(path.join(dir, 'pnpm-lock.yaml'))) throw new Error('模板缺少锁文件：' + name)
  renameSync(path.join(dir, 'pnpm-lock.yaml'), path.join(dir, 'pnpm-lock.template'))
}
const vp = process.platform === 'win32' ? 'vp.exe' : 'vp'
execFileSync(vp, ['pm', 'pack', '--out', path.join(artifacts, 'create-vp-starter.tgz')], {
  cwd: stage,
  stdio: 'inherit',
})
if (!readdirSync(artifacts).includes('create-vp-starter.tgz')) throw new Error('打包产物缺失')
