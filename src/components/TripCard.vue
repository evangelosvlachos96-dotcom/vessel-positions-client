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
            <span v-if="hasActiveFilters" class="text-cyan-300">
              · {{ filteredTotal.toLocaleString() }} matching filters
            </span>
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

    <div class="relative h-80 min-h-80 overflow-hidden">
      <div class="h-full overflow-auto">
        <table class="min-w-full table-fixed text-left text-sm">
          <thead class="sticky top-0 z-[1] bg-slate-900/95 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th class="w-[34%] px-5 py-3 font-medium">Time (UTC)</th>
              <th class="w-[36%] px-5 py-3 font-medium">Location</th>
              <th class="w-[15%] px-5 py-3 font-medium">Latitude</th>
              <th class="w-[15%] px-5 py-3 font-medium">Longitude</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="position in positions"
              :key="position.id"
              class="transition hover:bg-white/5"
              :class="{ 'opacity-50': positionsLoading }"
            >
              <td class="truncate px-5 py-3 font-mono text-slate-300">
                {{ position.receivedTimeUtc }}
              </td>
              <td class="truncate px-5 py-3 text-slate-300">
                {{ locationFor(position.latitude, position.longitude) }}
              </td>
              <td class="px-5 py-3 font-mono text-cyan-200">
                {{ position.latitude.toFixed(5) }}
              </td>
              <td class="px-5 py-3 font-mono text-cyan-200">
                {{ position.longitude.toFixed(5) }}
              </td>
            </tr>
            <tr v-if="!positionsLoading && positions.length === 0">
              <td colspan="4" class="px-5 py-6 text-center text-slate-400">
                No positions match the current filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <TableLoader v-if="positionsLoading" />
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/5 px-5 py-3"
    >
      <p class="text-sm text-slate-400">
        <template v-if="filteredTotal > 0">
          Showing {{ rangeStart.toLocaleString() }}–{{ rangeEnd.toLocaleString() }} of
          {{ filteredTotal.toLocaleString() }}
        </template>
        <template v-else>No matching positions</template>
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
import { computed, onMounted, ref, watch } from 'vue';
import { fetchTripPositions } from '../api/trips';
import TableLoader from './TableLoader.vue';
import type { IPosition, ITripFilters, IVesselTripSummary } from '../types/interfaces';
import { getLocationFromCoordinates } from '../utils/location';

const props = defineProps<{
  summary: IVesselTripSummary;
  filters: ITripFilters;
  refreshKey?: number;
}>();

const positions = ref<IPosition[]>([]);
const filteredTotal = ref(0);
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

const hasActiveFilters = computed(
  () =>
    props.filters.from !== '' ||
    props.filters.to !== '' ||
    props.filters.region !== '',
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

const rangeStart = computed(() =>
  filteredTotal.value === 0 ? 0 : offset.value + 1,
);

const rangeEnd = computed(() =>
  Math.min(offset.value + positions.value.length, filteredTotal.value),
);

const canGoPrev = computed(() => offset.value > 0);

const pageLimit = computed(() => props.filters.limit);

const canGoNext = computed(
  () => offset.value + pageLimit.value < filteredTotal.value,
);

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
    const page = await fetchTripPositions(
      props.summary.vesselId,
      offset.value,
      props.filters,
    );
    positions.value = page.items;
    filteredTotal.value = page.total;
  } catch (err) {
    positions.value = [];
    filteredTotal.value = 0;
    positionsError.value =
      err instanceof Error ? err.message : 'Failed to load positions';
  } finally {
    positionsLoading.value = false;
  }
};

const goPrev = (): void => {
  offset.value = Math.max(0, offset.value - pageLimit.value);
  void loadPositions();
};

const goNext = (): void => {
  offset.value += pageLimit.value;
  void loadPositions();
};

watch(
  () => props.filters,
  () => {
    offset.value = 0;
    void loadPositions();
  },
  { deep: true },
);

watch(
  () => props.refreshKey,
  () => {
    offset.value = 0;
    void loadPositions();
  },
);

onMounted(() => {
  void loadPositions();
});
</script>
