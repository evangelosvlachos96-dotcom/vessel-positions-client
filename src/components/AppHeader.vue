<template>
  <header class="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
      <RouterLink to="/" class="group flex items-center gap-3">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-lg ring-1 ring-cyan-400/30 transition group-hover:bg-cyan-500/25"
        >
          ⚓
        </span>
        <div>
          <p class="text-sm font-semibold tracking-wide text-white">Vessel Position</p>
          <p class="text-xs text-slate-400">AIS monitoring</p>
        </div>
      </RouterLink>

      <nav class="flex items-center gap-1">
        <RouterLink
          to="/"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/trips"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          active-class="bg-white/10 text-white"
        >
          Trips
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
