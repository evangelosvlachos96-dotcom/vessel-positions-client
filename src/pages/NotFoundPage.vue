<template>
  <section class="flex min-h-[70vh] items-center justify-center px-4">
    <div class="max-w-lg text-center">
      <p class="text-7xl font-black tracking-tight text-white">404</p>
      <h1 class="mt-4 text-2xl font-semibold text-white">Page not found</h1>
      <p class="mt-3 text-sm leading-relaxed text-slate-400">
        The page you are looking for does not exist. Head back to the home page.
      </p>

      <RouterLink
        to="/"
        class="mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
      >
        Back to home
      </RouterLink>
    </div>
  </section>
</template>
