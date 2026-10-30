import path from 'node:path'
import { definePlugin, defineRule } from 'vite-plus/lint/plugins'

/** 业务包只通过 exports 交互，不导入其他包的私有实现。 */
const noPrivateImports = defineRule({
  meta: {
    type: 'problem',
    schema: [],
    messages: { privateImport: '禁止跨包导入私有 src，请使用工作区包的公开 exports。' },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    const owner = filename.match(/^(.*\/(?:apps|packages)\/[^/]+)\//)?.[1]
    function check(node, value) {
      if (typeof value !== 'string') return
      const aliasPrivate = /^@starter\/[^/]+\/src(?:\/|$)/.test(value)
      const resolved = value.startsWith('.')
        ? path.resolve(path.dirname(context.filename), value).replaceAll('\\', '/')
        : ''
      const otherPackage = resolved.match(/^(.*\/(?:apps|packages)\/[^/]+)\/src(?:\/|$)/)?.[1]
      if (aliasPrivate || (owner && otherPackage && owner !== otherPackage))
        context.report({ node, messageId: 'privateImport' })
    }
    return {
      ImportDeclaration(node) {
        check(node, node.source.value)
      },
      ExportNamedDeclaration(node) {
        if (node.source) check(node, node.source.value)
      },
      ExportAllDeclaration(node) {
        check(node, node.source.value)
      },
      ImportExpression(node) {
        check(node, node.source.value)
      },
    }
  },
})

export default definePlugin({
  meta: { name: 'workspace' },
  rules: { 'no-private-imports': noPrivateImports },
})
