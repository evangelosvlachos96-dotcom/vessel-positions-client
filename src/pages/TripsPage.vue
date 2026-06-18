<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-3xl font-bold text-white">Vessel Trips</h1>
      <p class="mt-2 text-sm text-slate-400">
        Loaded from <code class="text-cyan-200">GET /positions/trips</code>
      </p>
    </section>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" />

    <section
      v-else-if="trips.length === 0"
      class="rounded-2xl border border-dashed border-white/10 p-10 text-center"
    >
      <p class="text-lg font-medium text-white">No trips yet</p>
      <p class="mt-2 text-sm text-slate-400">
        Run the backend ingest script first, then refresh this page.
      </p>
    </section>

    <section v-else class="space-y-5">
      <p class="text-sm text-slate-400">
        {{ trips.length }} vessels · {{ totalPositions.toLocaleString() }} positions
      </p>
      <TripCard v-for="trip in trips" :key="trip.vesselId" :trip="trip" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchTrips } from '../api/trips';
import ErrorState from '../components/ErrorState.vue';
import LoadingState from '../components/LoadingState.vue';
import TripCard from '../components/TripCard.vue';
import type { IVesselTrip } from '../types/trip';

const trips = ref<IVesselTrip[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const totalPositions = computed(() =>
  trips.value.reduce((sum, trip) => sum + trip.positions.length, 0),
);

onMounted(async () => {
  try {
    trips.value = await fetchTrips();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load trips';
  } finally {
    loading.value = false;
  }
});
</script>
