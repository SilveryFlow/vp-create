import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const vp = process.platform === 'win32' ? 'vp.exe' : 'vp'
const env = { ...process.env, VP_GIT_HOOKS: '1' }
const git = ['-c', 'user.name=Template verification', '-c', 'user.email=template@example.invalid']
function run(command, args, expected = true) {
  const result = spawnSync(command, args, { cwd: root, env, encoding: 'utf8' })
  assert.equal(result.status === 0, expected, (result.stdout + result.stderr).slice(-6000))
  return result.stdout + result.stderr
}
function file(name, value) {
  writeFileSync(resolve(root, name), value)
}
function commit(message, expected = true) {
  return run('git', [...git, 'commit', '-m', message], expected)
}
// 验证仅用于临时生成工程，禁止在用户已有 Git 仓库中制造提交。
assert.equal(
  existsSync(resolve(root, '.git')),
  false,
  '请在未初始化 Git 的临时生成工程中运行 verify:hooks',
)
run('git', ['init', '-b', 'main'])
run(vp, ['run', 'prepare'])
assert.match(run(vp, ['run', 'hooks:status']), /installed/)
run('git', ['add', '.'])
commit('chore: 初始化验证工程')
console.log('通过：prepare 对应的 hooks 安装与合法首次提交')
file('HOOK-CHECK.md', '# 提交检查\n')
run('git', ['add', 'HOOK-CHECK.md'])
assert.match(commit('无效提交信息', false), /type-empty|subject-empty/)
commit('docs: 验证提交规范')
console.log('通过：commit-msg 拦截错误信息并允许规范信息')
const bad = 'packages/utils/src/hook-check.ts'
file(bad, 'export const unsafe: any = 1\n')
run('git', ['add', bad])
assert.match(commit('test: 验证 lint 拦截', false), /no-explicit-any/)
file(bad, 'export const safe=1;\n')
run('git', ['add', bad])
assert.match(commit('test: 验证格式拦截', false), /Format issues|formatting|格式/)
file(bad, 'export const safe = 1\n')
run('git', ['add', bad])
commit('test: 验证暂存检查')
console.log('通过：pre-commit 拦截 lint 和格式错误')
const style = 'packages/ui/src/hook-check.css'
file(style, '.hook-check {\n  unknown-property: red;\n}\n')
run('git', ['add', style])
assert.match(commit('test: 验证样式拦截', false), /property-no-unknown/)
run('git', ['rm', '-f', style])
console.log('通过：staged 拦截样式错误')
file(bad, "export const typed: number = 'wrong'\n")
run('git', ['add', bad])
assert.match(commit('test: 验证类型拦截', false), /TS2322|not assignable/)
file(bad, 'export const safe = 1\n')
run('git', ['add', bad])
console.log('通过：pre-commit 拦截真实类型错误')
const testFile = 'packages/utils/src/__tests__/index.test.ts'
const original = readFileSync(resolve(root, testFile), 'utf8')
try {
  file(testFile, original.replace('toBe(-1)', 'toBe(999)'))
  assert.match(run(vp, ['run', '@starter/utils#test'], false), /FAIL|failed/)
} finally {
  file(testFile, original)
}
console.log('通过：test 能检测失败断言')
run(vp, ['run', 'verify'])
const remote = resolve(root, '.artifacts/hooks-remote.git')
run('git', ['init', '--bare', remote])
run('git', ['remote', 'add', 'hook-audit', remote])
run('git', ['push', 'hook-audit', 'main'])
console.log('通过：真实本地 Git push 触发 pre-push 并通过 verify')
assert.equal(run('git', ['status', '--porcelain']).trim(), '')
assert.equal(existsSync(resolve(root, '.vite-hooks/pre-push')), true)
console.log('通过：恢复后 verify 通过且 Git 工作区干净；pre-push 复用同一 verify')
