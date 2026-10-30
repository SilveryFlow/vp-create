#!/usr/bin/env node
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
const { values } = parseArgs({ options: { template: { type: 'string' }, directory: { type: 'string' }, help: { type: 'boolean' } } })
if (values.help) { console.log('--template vue3-ts|monorepo --directory <新工程目录>'); process.exit(0) }
if (!['vue3-ts', 'monorepo'].includes(values.template) || !values.directory) throw new Error('请传入 --template vue3-ts|monorepo --directory <新工程目录>')
const source = fileURLToPath(new URL('../templates/' + values.template, import.meta.url))
const target = path.resolve(values.directory)
if (target === source || target.startsWith(source + path.sep)) throw new Error('目标目录不能位于模板源码内')
if (existsSync(target) && readdirSync(target).length) throw new Error('目标目录非空，已停止，未覆盖文件：' + target)

// 模板源码可以原地开发，生成时只复制工程文件。
const excluded = new Set(['node_modules', '.git', 'dist', 'dist-ssr', 'coverage', '.vite', '.cspellcache', '.eslintcache', '.eslintrc-auto-import.json', '.DS_Store'])
cpSync(source, target, {
  recursive: true,
  filter: entry => {
    const relative = path.relative(source, entry)
    return !relative.split(path.sep).some(part => excluded.has(part) || part === '_')
      && !entry.endsWith('.local') && !entry.endsWith('.tsbuildinfo') && !entry.endsWith('.log')
  },
})
const manifest = path.join(target, 'package.json')
const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
pkg.name = path.basename(target).toLowerCase().replace(/[^a-z0-9._-]/g, '-')
writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n')
console.log('已创建：' + target + '\n进入工程后执行 vp install，再执行 vp run dev。')
