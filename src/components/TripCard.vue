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
          {{ summary.vesselId }}
        </span>
        <div>
          <h2 class="text-lg font-semibold text-white">Vessel {{ summary.vesselId }}</h2>
          <p class="text-sm text-slate-400">
            {{ summary.total.toLocaleString() }} position reports
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300 ring-1 ring-emerald-400/20">
          Start {{ formatTime(summary.firstPosition.receivedTimeUtc) }}
        </span>
        <span class="rounded-full bg-rose-500/15 px-3 py-1 text-rose-300 ring-1 ring-rose-400/20">
          End {{ formatTime(summary.lastPosition.receivedTimeUtc) }}
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

    <div v-if="positionsError" class="border-b border-white/10 px-5 py-4">
      <p class="text-sm text-rose-300">{{ positionsError }}</p>
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
          <tr v-if="positionsLoading">
            <td colspan="4" class="px-5 py-6 text-center text-slate-400">Loading positions…</td>
          </tr>
          <tr
            v-for="position in positions"
            v-else
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

    <div
      class="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/5 px-5 py-3"
    >
      <p class="text-sm text-slate-400">
        <template v-if="summary.total > 0">
          Showing {{ rangeStart.toLocaleString() }}–{{ rangeEnd.toLocaleString() }} of
          {{ summary.total.toLocaleString() }}
        </template>
        <template v-else>No positions</template>
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!canGoPrev || positionsLoading"
          @click="goPrev"
        >
          Previous
        </button>
        <button
          type="button"
          class="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!canGoNext || positionsLoading"
          @click="goNext"
        >
          Next
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchTripPositions, PAGE_SIZE } from '../api/trips';
import type { IPosition, IVesselTripSummary } from '../types/trip';
import { getLocationFromCoordinates } from '../utils/location';

const props = defineProps<{
  summary: IVesselTripSummary;
}>();

const positions = ref<IPosition[]>([]);
const offset = ref(0);
const positionsLoading = ref(true);
const positionsError = ref<string | null>(null);

const accentClasses = [
  'bg-cyan-500/20 ring-1 ring-cyan-400/30',
  'bg-violet-500/20 ring-1 ring-violet-400/30',
  'bg-amber-500/20 ring-1 ring-amber-400/30',
];

const accentClass = computed(
  () => accentClasses[props.summary.vesselId % accentClasses.length],
);

const startLocation = computed(() =>
  getLocationFromCoordinates(
    props.summary.firstPosition.latitude,
    props.summary.firstPosition.longitude,
  ),
);

const endLocation = computed(() =>
  getLocationFromCoordinates(
    props.summary.lastPosition.latitude,
    props.summary.lastPosition.longitude,
  ),
);

const rangeStart = computed(() => (props.summary.total === 0 ? 0 : offset.value + 1));

const rangeEnd = computed(() =>
  Math.min(offset.value + positions.value.length, props.summary.total),
);

const canGoPrev = computed(() => offset.value > 0);

const canGoNext = computed(() => offset.value + PAGE_SIZE < props.summary.total);

const locationFor = (latitude: number, longitude: number): string =>
  getLocationFromCoordinates(latitude, longitude);

const formatTime = (value: string): string =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const loadPositions = async (): Promise<void> => {
  positionsLoading.value = true;
  positionsError.value = null;

  try {
    const page = await fetchTripPositions(props.summary.vesselId, offset.value);
    positions.value = page.items;
  } catch (err) {
    positions.value = [];
    positionsError.value =
      err instanceof Error ? err.message : 'Failed to load positions';
  } finally {
    positionsLoading.value = false;
  }
};

const goPrev = (): void => {
  offset.value = Math.max(0, offset.value - PAGE_SIZE);
  void loadPositions();
};

const goNext = (): void => {
  offset.value += PAGE_SIZE;
  void loadPositions();
};

onMounted(() => {
  void loadPositions();
});
</script>
