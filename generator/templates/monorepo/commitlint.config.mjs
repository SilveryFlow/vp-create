import { defineConfig } from 'cz-git'

export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  rules: { 'subject-empty': [2, 'never'], 'type-empty': [2, 'never'] },
  prompt: {
    useEmoji: false,
    useAI: false,
    allowCustomScopes: true,
    allowEmptyScopes: true,
    scopes: ['web', 'admin', 'ui', 'utils', 'vite-config', 'uno-config', 'workspace'],
    messages: {
      type: '选择提交类型：',
      scope: '选择影响范围：',
      customScope: '输入自定义范围：',
      subject: '填写简短变更说明：',
      body: '填写详细说明（可跳过）：',
      breaking: '填写不兼容变更（可跳过）：',
      footer: '关联 Issue（可跳过）：',
      confirmCommit: '确认提交？',
    },
    types: [
      { value: 'feat', name: 'feat: 新功能' },
      { value: 'fix', name: 'fix: 修复问题' },
      { value: 'refactor', name: 'refactor: 重构' },
      { value: 'perf', name: 'perf: 性能优化' },
      { value: 'test', name: 'test: 测试' },
      { value: 'docs', name: 'docs: 文档' },
      { value: 'style', name: 'style: 格式调整' },
      { value: 'build', name: 'build: 构建' },
      { value: 'ci', name: 'ci: 持续集成' },
      { value: 'chore', name: 'chore: 工程维护' },
      { value: 'revert', name: 'revert: 回退' },
    ],
  },
})
