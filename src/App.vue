<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchTrips } from './api/trips';
import type { IVesselTrip } from './types/trip';

const trips = ref<IVesselTrip[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

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

<template>
  <h1>Vessel Trips</h1>

  <p v-if="loading">Loading…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <p v-else-if="trips.length === 0" class="muted">No trips found.</p>

  <article v-for="trip in trips" :key="trip.vesselId" class="trip">
    <h2>Vessel {{ trip.vesselId }}</h2>
    <p class="muted">{{ trip.positions.length }} positions</p>

    <table>
      <thead>
        <tr>
          <th>Time (UTC)</th>
          <th>Latitude</th>
          <th>Longitude</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="position in trip.positions" :key="position.id">
          <td>{{ position.receivedTimeUtc }}</td>
          <td>{{ position.latitude }}</td>
          <td>{{ position.longitude }}</td>
        </tr>
      </tbody>
    </table>
  </article>
</template>
