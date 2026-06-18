<template>
  <div class="space-y-6">
    <section class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-3xl font-bold text-white">Vessel Trips</h1>
      <button
        v-if="!loading && !error && trips.length > 0"
        type="button"
        class="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        @click="showAddModal = true"
      >
        Add positions
      </button>
    </section>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" />

    <template v-else>
      <TripFilters v-model="filters" :vessel-ids="vesselIds" />

      <section
        v-if="trips.length === 0"
        class="rounded-2xl border border-dashed border-white/10 p-10 text-center"
      >
        <p class="text-lg font-medium text-white">No trips yet</p>
        <p class="mt-2 text-sm text-slate-400">
          Run the backend ingest script first, then refresh this page.
        </p>
      </section>

      <section
        v-else-if="visibleTrips.length === 0"
        class="rounded-2xl border border-dashed border-white/10 p-10 text-center"
      >
        <p class="text-lg font-medium text-white">No vessels match your filters</p>
        <p class="mt-2 text-sm text-slate-400">Try clearing the vessel filter.</p>
      </section>

      <section v-else class="space-y-5">
        <p class="text-sm text-slate-400">
          {{ visibleTrips.length }} vessels · {{ totalPositions.toLocaleString() }} positions
        </p>
        <TripCard
          v-for="trip in visibleTrips"
          :key="trip.vesselId"
          :summary="trip"
          :filters="filters"
          :offset="offsetsByVessel[trip.vesselId] ?? 0"
          :refresh-key="refreshKey"
          @update:offset="setVesselOffset(trip.vesselId, $event)"
        />
      </section>
    </template>

    <AddPositionModal
      :open="showAddModal"
      :vessel-ids="vesselIds"
      @close="showAddModal = false"
      @saved="reloadTrips"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchTripSummaries } from '../api/trips';
import AddPositionModal from '../components/AddPositionModal.vue';
import ErrorState from '../components/ErrorState.vue';
import LoadingState from '../components/LoadingState.vue';
import TripCard from '../components/TripCard.vue';
import TripFilters from '../components/TripFilters.vue';
import type { ITripFilters, IVesselTripSummary } from '../types/interfaces';
import {
  buildTripsQuery,
  parseOffsetsFromQuery,
  parseTripFiltersFromQuery,
} from '../utils/trip-filters-url';

const route = useRoute();
const router = useRouter();

const trips = ref<IVesselTripSummary[]>([]);
const filters = ref<ITripFilters>(parseTripFiltersFromQuery(route.query));
const offsetsByVessel = ref<Record<number, number>>(
  parseOffsetsFromQuery(route.query),
);
const loading = ref(true);
const error = ref<string | null>(null);
const showAddModal = ref(false);
const refreshKey = ref(0);

const vesselIds = computed(() => trips.value.map((trip) => trip.vesselId));

const visibleTrips = computed(() => {
  if (filters.value.vesselId === null) {
    return trips.value;
  }

  return trips.value.filter((trip) => trip.vesselId === filters.value.vesselId);
});

const totalPositions = computed(() =>
  visibleTrips.value.reduce((sum, trip) => sum + trip.total, 0),
);

const reloadTrips = async (): Promise<void> => {
  trips.value = await fetchTripSummaries();
  refreshKey.value += 1;
};

const setVesselOffset = (vesselId: number, offset: number): void => {
  if (offset <= 0) {
    const { [vesselId]: _, ...rest } = offsetsByVessel.value;
    offsetsByVessel.value = rest;
    return;
  }

  offsetsByVessel.value = {
    ...offsetsByVessel.value,
    [vesselId]: offset,
  };
};

watch(
  filters,
  () => {
    offsetsByVessel.value = {};
  },
  { deep: true },
);

watch(
  [filters, offsetsByVessel],
  () => {
    const nextQuery = buildTripsQuery(filters.value, offsetsByVessel.value);
    const currentQuery = route.query as Record<string, string>;

    if (JSON.stringify(nextQuery) === JSON.stringify(currentQuery)) {
      return;
    }

    void router.replace({ query: nextQuery });
  },
  { deep: true },
);

onMounted(async () => {
  try {
    await reloadTrips();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load trips';
  } finally {
    loading.value = false;
  }
});
</script>
