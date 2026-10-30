import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs'
import { resolve, dirname, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { checkArtifacts } from './check-artifacts.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
checkArtifacts()
const output = resolve(root, '.artifacts/delivery')
if (!output.startsWith(root + sep)) throw new Error('归档路径越界')
rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })
let revision = process.env.GITHUB_SHA || 'unknown'
try {
  revision = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
} catch {
  /* 无 Git 的生成工程保留 unknown。 */
}
const versions = Object.fromEntries(
  readdirSync(resolve(root, 'packages')).map(folder => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'packages', folder, 'package.json'), 'utf8'))
    return [pkg.name, pkg.version]
  }),
)
const artifacts = []
/** 比较全部文件，避免只校验 HTML 而漏掉资源。 */
function hashes(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
      const name = prefix + entry.name
      const file = resolve(directory, entry.name)
      if (entry.isDirectory()) return hashes(file, name + '/')
      if (!entry.isFile()) throw new Error('交付目录只允许普通文件：' + name)
      return [[name, createHash('sha256').update(readFileSync(file)).digest('hex')]]
    })
}
for (const app of readdirSync(resolve(root, 'apps'))) {
  const directory = resolve(root, 'apps', app)
  const pkg = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'))
  const filename = app + '-' + pkg.version + '.tgz'
  const tarball = resolve(output, filename)
  execFileSync('tar', ['-czf', tarball, '-C', resolve(directory, 'dist'), '.'])
  const sha256 = createHash('sha256').update(readFileSync(tarball)).digest('hex')
  const temp = mkdtempSync(resolve(tmpdir(), 'vp-delivery-'))
  try {
    execFileSync('tar', ['-xzf', tarball, '-C', temp])
    const original = JSON.stringify(hashes(resolve(directory, 'dist')))
    const restored = JSON.stringify(hashes(temp))
    if (original !== restored) throw new Error('归档内容与构建不一致')
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
  artifacts.push({ application: pkg.name, version: pkg.version, file: filename, sha256 })
}
writeFileSync(
  resolve(output, 'manifest.json'),
  JSON.stringify({ revision, packages: versions, artifacts }, null, 2) + '\n',
)
writeFileSync(
  resolve(output, 'SHA256SUMS'),
  artifacts.map(item => item.sha256 + '  ' + item.file).join('\n') + '\n',
)
console.log('交付归档校验通过：' + output)
