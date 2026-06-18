<template>
  <div class="space-y-8">
    <section
      class="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/30 sm:p-12"
    >
      <div
        class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
      />

      <p class="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300/80">
        Vessel Position
      </p>
      <h1 class="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
        Monitor vessel movements with precision
      </h1>
      <p class="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
        Welcome to the vessel position platform. Track AIS reports, review historical routes, and
        keep your fleet insight in one place.
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <RouterLink
          to="/trips"
          class="inline-flex rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          View vessel trips
        </RouterLink>
        <div class="rounded-2xl bg-black/20 px-5 py-4 ring-1 ring-white/10">
          <p class="text-xs uppercase tracking-wide text-slate-400">Status</p>
          <p class="mt-1 text-sm font-medium text-emerald-300">Ready</p>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <article class="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p class="text-2xl">📡</p>
        <h2 class="mt-3 font-semibold text-white">Real-time data</h2>
        <p class="mt-2 text-sm text-slate-400">
          Positions ingested from AIS reports and stored for analysis.
        </p>
      </article>
      <article class="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p class="text-2xl">🗺️</p>
        <h2 class="mt-3 font-semibold text-white">Route history</h2>
        <p class="mt-2 text-sm text-slate-400">
          Every report is timestamped and georeferenced for accurate tracking.
        </p>
      </article>
      <article class="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p class="text-2xl">⚓</p>
        <h2 class="mt-3 font-semibold text-white">Fleet overview</h2>
        <p class="mt-2 text-sm text-slate-400">
          A single view for monitoring multiple vessels across regions.
        </p>
      </article>
    </section>
  </div>
</template>
