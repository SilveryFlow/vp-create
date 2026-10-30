<template>
  <main class="mx-auto max-w-3xl p-8">
    <h1>管理示例</h1>
    <nav class="mb-6 flex gap-4">
      <RouterLink to="/">首页</RouterLink><RouterLink to="/about">关于</RouterLink>
    </nav>
    <RouterView />
  </main>
</template>
