/** 自动追踪源码和读写；生成声明作为输出恢复，不参与输入失效。 */
export const buildCache = {
  input: [
    { auto: true as const },
    '!src',
    '!dist',
    '!node_modules',
    '!src/components.d.ts',
    '!dist/**',
    '!node_modules/.vite/**',
  ],
  output: [{ auto: true as const }, 'dist/**', 'src/components.d.ts', '!node_modules/.vite/**'],
}

export const dependencyBuilds: { task: string; from: ('dependencies' | 'devDependencies')[] }[] = [
  { task: 'build', from: ['dependencies', 'devDependencies'] },
]
