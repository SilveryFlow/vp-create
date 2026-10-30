#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { createProject } from '../src/create.mjs'

try {
  const { values } = parseArgs({
    options: {
      template: { type: 'string' },
      directory: { type: 'string' },
      help: { type: 'boolean' },
    },
  })
  if (values.help) {
    console.log('--template vue3-ts|monorepo --directory <新工程目录>')
  } else {
    const target = createProject({ template: values.template, directory: values.directory })
    console.log('已创建：' + target + '\n进入工程后执行 vp install，再执行 vp run dev。')
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
