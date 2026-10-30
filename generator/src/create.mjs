import {
  cpSync,
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const templateRoot = fileURLToPath(new URL('../templates/', import.meta.url))
const excluded = new Set([
  'node_modules',
  '.git',
  'dist',
  'dist-ssr',
  'coverage',
  '.vite',
  '.artifacts',
  '.cspellcache',
  '.eslintcache',
  '.eslintrc-auto-import.json',
  '.DS_Store',
])

/** @param {string} source @param {string} entry */
export function includeFile(source, entry) {
  const parts = path.relative(source, entry).split(path.sep)
  return (
    !parts.some((part) => excluded.has(part)) &&
    !(parts.includes('.husky') && parts.includes('_')) &&
    !(parts.includes('.vite-hooks') && parts.includes('_')) &&
    !entry.endsWith('.local') &&
    !entry.endsWith('.tsbuildinfo') &&
    !entry.endsWith('.log')
  )
}

/** 解析尚未创建的路径，同时解析已有父目录的软链接。
 * @param {string} target
 * @returns {string}
 */
function canonical(target) {
  if (existsSync(target)) return realpathSync(target)
  return path.join(canonical(path.dirname(target)), path.basename(target))
}

/** @param {string} root @param {string} target */
function inside(root, target) {
  const relative = path.relative(root, target)
  return (
    relative === '' ||
    (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))
  )
}

/** 恢复 npm 打包时重命名的锁文件。
 * @param {string} directory
 */
function restoreLocks(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) restoreLocks(file)
    else if (entry.name === '_gitignore') renameSync(file, path.join(directory, '.gitignore'))
    else if (entry.name === 'pnpm-lock.template')
      renameSync(file, path.join(directory, 'pnpm-lock.yaml'))
  }
}

/** 从唯一模板源码生成独立工程。
 * @param {{template?: string, directory?: string, templates?: string}} options
 */
export function createProject({ template, directory, templates = templateRoot }) {
  if (!template || !['vue3-ts', 'monorepo'].includes(template) || !directory?.trim()) {
    throw new Error('请传入 --template vue3-ts|monorepo --directory <新工程目录>')
  }
  const source = path.join(templates, template)
  const target = path.resolve(directory)
  const resolvedTarget = canonical(target)
  const resolvedTemplates = canonical(templates)
  if (inside(resolvedTemplates, resolvedTarget) || inside(resolvedTarget, resolvedTemplates)) {
    throw new Error('目标目录不能位于模板目录内，也不能包含模板目录')
  }
  if (existsSync(target) && (!lstatSync(target).isDirectory() || readdirSync(target).length)) {
    throw new Error('目标目录非空或不是目录，已停止：' + target)
  }
  const name = path
    .basename(target)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/^[._-]+/, '')
  if (!name) throw new Error('目标目录名必须包含英文字母或数字')
  // 复制前检查清单，防止无效模板留下半成品。
  const pkg = JSON.parse(readFileSync(path.join(source, 'package.json'), 'utf8'))
  const existed = existsSync(target)
  try {
    cpSync(source, target, { recursive: true, filter: (entry) => includeFile(source, entry) })
    restoreLocks(target)
    pkg.name = name
    writeFileSync(path.join(target, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  } catch (error) {
    // 目标已确认是新目录或空目录；失败时仅清理本次复制的内容。
    if (!existed) rmSync(target, { recursive: true, force: true })
    else
      for (const entry of readdirSync(target))
        rmSync(path.join(target, entry), { recursive: true, force: true })
    throw error
  }
  return target
}
