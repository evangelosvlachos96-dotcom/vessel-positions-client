<template>
  <section
    class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20"
  >
    <div class="mb-4 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Filters
        </h2>
        <p class="mt-1 text-xs text-slate-500">Narrow trips by vessel, date, region, or page size</p>
      </div>
      <button
        v-if="hasActiveFilters"
        type="button"
        class="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 ring-1 ring-inset ring-white/10 transition hover:bg-white/10"
        @click="clearFilters"
      >
        Clear all
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <label class="block space-y-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-slate-500">Vessel</span>
        <select
          :value="modelValue.vesselId ?? ''"
          :class="selectClass"
          @change="updateVessel(($event.target as HTMLSelectElement).value)"
        >
          <option value="">All vessels</option>
          <option v-for="id in vesselIds" :key="id" :value="id">
            Vessel {{ id }}
          </option>
        </select>
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-slate-500">From date</span>
        <input
          type="date"
          :value="modelValue.from"
          :class="dateClass"
          @input="emit('update:modelValue', { ...modelValue, from: ($event.target as HTMLInputElement).value })"
        />
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-slate-500">To date</span>
        <input
          type="date"
          :value="modelValue.to"
          :class="dateClass"
          @input="emit('update:modelValue', { ...modelValue, to: ($event.target as HTMLInputElement).value })"
        />
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-slate-500">Region</span>
        <select
          :value="modelValue.region"
          :class="selectClass"
          @change="emit('update:modelValue', { ...modelValue, region: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">All regions</option>
          <option v-for="region in OCEAN_REGION_NAMES" :key="region" :value="region">
            {{ region }}
          </option>
        </select>
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-medium uppercase tracking-wide text-slate-500">Per page</span>
        <select
          :value="modelValue.limit"
          :class="selectClass"
          @change="updateLimit(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="size in PAGE_LIMIT_OPTIONS" :key="size" :value="size">
            {{ size }} rows
          </option>
        </select>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ITripFilters } from '../types/interfaces';
import { emptyTripFilters, PAGE_LIMIT_OPTIONS } from '../utils/trip-filters';
import { OCEAN_REGION_NAMES } from '../utils/location';

const fieldClass =
  'w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-slate-100 shadow-inner shadow-black/10 outline-none ring-1 ring-inset ring-white/10 transition focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-500/35';

const selectClass = `${fieldClass} filter-select`;

const dateClass = `${fieldClass} [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100`;

const props = defineProps<{
  modelValue: ITripFilters;
  vesselIds: number[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ITripFilters];
}>();

const hasActiveFilters = computed(
  () =>
    props.modelValue.vesselId !== null ||
    props.modelValue.from !== '' ||
    props.modelValue.to !== '' ||
    props.modelValue.region !== '',
);

const updateVessel = (value: string): void => {
  emit('update:modelValue', {
    ...props.modelValue,
    vesselId: value === '' ? null : Number(value),
  });
};

const updateLimit = (value: string): void => {
  emit('update:modelValue', {
    ...props.modelValue,
    limit: Number(value),
  });
};

const clearFilters = (): void => {
  emit('update:modelValue', emptyTripFilters());
};
</script>

<style scoped>
.filter-select {
  appearance: none;
  color-scheme: dark;
  padding-right: 1.75rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 0.875rem 0.875rem;
}

.filter-select option {
  background-color: #0f172a;
  color: #e2e8f0;
}
</style>
