<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-3xl font-bold text-white">Vessel Trips</h1>
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
        />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchTripSummaries } from '../api/trips';
import ErrorState from '../components/ErrorState.vue';
import LoadingState from '../components/LoadingState.vue';
import TripCard from '../components/TripCard.vue';
import TripFilters from '../components/TripFilters.vue';
import type { ITripFilters, IVesselTripSummary } from '../types/interfaces';
import { emptyTripFilters } from '../utils/trip-filters';

const trips = ref<IVesselTripSummary[]>([]);
const filters = ref<ITripFilters>(emptyTripFilters());
const loading = ref(true);
const error = ref<string | null>(null);

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

onMounted(async () => {
  try {
    trips.value = await fetchTripSummaries();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load trips';
  } finally {
    loading.value = false;
  }
});
</script>
