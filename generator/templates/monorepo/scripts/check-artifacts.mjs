import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
/** 只检查显式 exports 的文件入口，不要求配置包伪造构建产物。 */
export function checkArtifacts() {
  for (const folder of readdirSync(resolve(root, 'packages'))) {
    const directory = resolve(root, 'packages', folder)
    const manifest = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'))
    function check(value) {
      if (typeof value === 'string') {
        assert(value.startsWith('./'), '出口应为包内相对路径：' + value)
        const target = resolve(directory, value)
        assert(target.startsWith(directory + sep), '出口越界')
        assert(existsSync(target), manifest.name + ' 缺少公开产物：' + value)
      } else if (value !== null && typeof value === 'object') {
        for (const entry of Object.values(value)) check(entry)
      }
    }
    check(manifest.exports)
  }
  for (const app of readdirSync(resolve(root, 'apps'))) {
    assert(existsSync(resolve(root, 'apps', app, 'dist/index.html')), app + ' 缺少入口 HTML')
  }
  console.log('通过：公开 JS、声明、CSS、源码配置入口与应用 HTML 均存在')
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) checkArtifacts()
