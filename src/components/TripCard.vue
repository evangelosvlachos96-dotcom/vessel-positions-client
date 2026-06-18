<template>
  <section
    class="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/20"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-5 py-4"
    >
      <div class="flex items-center gap-3">
        <span
          class="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
          :class="accentClass"
        >
          {{ trip.vesselId }}
        </span>
        <div>
          <h2 class="text-lg font-semibold text-white">Vessel {{ trip.vesselId }}</h2>
          <p class="text-sm text-slate-400">
            {{ trip.positions.length.toLocaleString() }} position reports
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300 ring-1 ring-emerald-400/20">
          Start {{ formatTime(startPosition?.receivedTimeUtc) }}
        </span>
        <span class="rounded-full bg-rose-500/15 px-3 py-1 text-rose-300 ring-1 ring-rose-400/20">
          End {{ formatTime(endPosition?.receivedTimeUtc) }}
        </span>
      </div>
    </div>

    <div class="grid gap-3 border-b border-white/10 px-5 py-4 sm:grid-cols-2">
      <div class="rounded-xl bg-black/20 px-4 py-3 ring-1 ring-white/10">
        <p class="text-xs uppercase tracking-wide text-slate-500">Start location</p>
        <p class="mt-1 text-sm text-slate-200">{{ startLocation }}</p>
      </div>
      <div class="rounded-xl bg-black/20 px-4 py-3 ring-1 ring-white/10">
        <p class="text-xs uppercase tracking-wide text-slate-500">End location</p>
        <p class="mt-1 text-sm text-slate-200">{{ endLocation }}</p>
      </div>
    </div>

    <div class="max-h-80 overflow-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="sticky top-0 bg-slate-900/95 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th class="px-5 py-3 font-medium">Time (UTC)</th>
            <th class="px-5 py-3 font-medium">Location</th>
            <th class="px-5 py-3 font-medium">Latitude</th>
            <th class="px-5 py-3 font-medium">Longitude</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr
            v-for="position in trip.positions"
            :key="position.id"
            class="transition hover:bg-white/5"
          >
            <td class="px-5 py-3 font-mono text-slate-300">
              {{ position.receivedTimeUtc }}
            </td>
            <td class="px-5 py-3 text-slate-300">
              {{ locationFor(position.latitude, position.longitude) }}
            </td>
            <td class="px-5 py-3 font-mono text-cyan-200">
              {{ position.latitude.toFixed(5) }}
            </td>
            <td class="px-5 py-3 font-mono text-cyan-200">
              {{ position.longitude.toFixed(5) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IVesselTrip } from '../types/trip';
import { getLocationFromCoordinates } from '../utils/location';

const props = defineProps<{
  trip: IVesselTrip;
}>();

const accentClasses = [
  'bg-cyan-500/20 ring-1 ring-cyan-400/30',
  'bg-violet-500/20 ring-1 ring-violet-400/30',
  'bg-amber-500/20 ring-1 ring-amber-400/30',
];

const startPosition = computed(() => props.trip.positions[0]);
const endPosition = computed(() => props.trip.positions.at(-1));

const accentClass = computed(
  () => accentClasses[props.trip.vesselId % accentClasses.length],
);

const startLocation = computed(() => {
  const position = startPosition.value;
  if (!position) return '—';
  return getLocationFromCoordinates(position.latitude, position.longitude);
});

const endLocation = computed(() => {
  const position = endPosition.value;
  if (!position) return '—';
  return getLocationFromCoordinates(position.latitude, position.longitude);
});

const locationFor = (latitude: number, longitude: number): string =>
  getLocationFromCoordinates(latitude, longitude);

const formatTime = (value?: string): string => {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
