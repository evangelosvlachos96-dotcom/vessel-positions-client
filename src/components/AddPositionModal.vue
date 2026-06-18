<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-position-title"
    >
      <button
        type="button"
        class="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        aria-label="Close modal"
        @click="close"
      />

      <form
        novalidate
        class="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40"
        @submit.prevent="submit"
      >
        <div class="border-b border-white/10 bg-white/5 px-6 py-4">
          <h2 id="add-position-title" class="text-lg font-semibold text-white">
            Add vessel positions
          </h2>
          <p class="mt-1 text-sm text-slate-400">
            Submit one or more reports as a batch. Validation errors are returned by the server.
          </p>
        </div>

        <div class="space-y-4 overflow-y-auto px-6 py-5">
          <div
            v-if="successMessage"
            class="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            {{ successMessage }}
          </div>

          <ul
            v-if="generalErrors.length > 0"
            class="space-y-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            <li v-for="message in generalErrors" :key="message">{{ message }}</li>
          </ul>

          <label class="block max-w-xs space-y-1.5">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500">Vessel</span>
            <select
              v-model.number="vesselId"
              :class="[fieldClass, 'filter-select']"
              :disabled="submitting"
            >
              <option v-for="id in vesselIds" :key="id" :value="id">Vessel {{ id }}</option>
            </select>
          </label>

          <div class="space-y-4">
            <article
              v-for="(row, index) in rows"
              :key="row.id"
              class="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div class="mb-3 flex items-center justify-between gap-3">
                <h3 class="text-sm font-semibold text-slate-200">Row {{ index + 1 }}</h3>
                <button
                  v-if="rows.length > 1"
                  type="button"
                  class="text-xs text-slate-400 transition hover:text-rose-300"
                  :disabled="submitting"
                  @click="removeRow(row.id)"
                >
                  Remove
                </button>
              </div>

              <ul
                v-if="rowErrors[index]?.length"
                class="mb-3 space-y-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
              >
                <li v-for="message in rowErrors[index]" :key="message">{{ message }}</li>
              </ul>

              <div class="grid gap-4">
                <label class="block space-y-1.5">
                  <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Received time (UTC)
                  </span>
                  <DateTimeInput
                    v-model="row.receivedTimeUtc"
                    placeholder="Select UTC time"
                    :disabled="submitting"
                  />
                </label>

                <div class="grid gap-4 sm:grid-cols-2">
                  <label class="block space-y-1.5">
                    <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Latitude
                    </span>
                    <input
                      v-model="row.latitude"
                      type="text"
                      inputmode="decimal"
                      :class="fieldClass"
                      :disabled="submitting"
                    />
                  </label>

                  <label class="block space-y-1.5">
                    <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Longitude
                    </span>
                    <input
                      v-model="row.longitude"
                      type="text"
                      inputmode="decimal"
                      :class="fieldClass"
                      :disabled="submitting"
                    />
                  </label>
                </div>
              </div>
            </article>
          </div>

          <button
            type="button"
            class="rounded-lg border border-dashed border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
            :disabled="submitting"
            @click="addRow"
          >
            + Add another row
          </button>
        </div>

        <div class="flex justify-end gap-3 border-t border-white/10 bg-white/5 px-6 py-4">
          <button
            type="button"
            class="rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            :disabled="submitting"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submitting || !!successMessage"
          >
            {{ submitting ? 'Saving…' : `Save ${rows.length} position${rows.length === 1 ? '' : 's'}` }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  createPositions,
  parseCreatePositionsFailure,
} from '../api/positions';
import DateTimeInput from './DateTimeInput.vue';
import type { ICreatePositionInput } from '../types/interfaces';

interface IPositionRow {
  id: number;
  receivedTimeUtc: string;
  latitude: string;
  longitude: string;
}

const props = defineProps<{
  open: boolean;
  vesselIds: number[];
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const SUCCESS_TIMEOUT_MS = 2500;

let nextRowId = 1;

const vesselId = ref(0);
const rows = ref<IPositionRow[]>([createRow()]);
const submitting = ref(false);
const successMessage = ref<string | null>(null);
const rowErrors = ref<Record<number, string[]>>({});
const generalErrors = ref<string[]>([]);

let successTimer: ReturnType<typeof setTimeout> | null = null;

const fieldClass =
  'w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-slate-100 shadow-inner shadow-black/10 outline-none ring-1 ring-inset ring-white/10 transition focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-500/35 disabled:opacity-60';

function createRow(): IPositionRow {
  return {
    id: nextRowId++,
    receivedTimeUtc: '',
    latitude: '',
    longitude: '',
  };
}

const resetForm = (): void => {
  vesselId.value = props.vesselIds[0] ?? 0;
  rows.value = [createRow()];
  rowErrors.value = {};
  generalErrors.value = [];
  successMessage.value = null;
};

const addRow = (): void => {
  rows.value.push(createRow());
};

const removeRow = (id: number): void => {
  rows.value = rows.value.filter((row) => row.id !== id);
};

const clearSuccessTimer = (): void => {
  if (successTimer) {
    clearTimeout(successTimer);
    successTimer = null;
  }
};

const close = (): void => {
  if (submitting.value) {
    return;
  }
  clearSuccessTimer();
  emit('close');
};

const emptyToNull = (value: string): string | null =>
  value.trim() === '' ? null : value.trim();

/** datetime-local value is treated as UTC; server validates the ISO string. */
const toUtcIsoString = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }

  const normalized = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  return `${normalized}.000Z`;
};

const buildPayload = (): ICreatePositionInput[] =>
  rows.value.map((row) => ({
    vesselId: vesselId.value,
    receivedTimeUtc: toUtcIsoString(row.receivedTimeUtc),
    latitude: emptyToNull(row.latitude),
    longitude: emptyToNull(row.longitude),
  }));

const applyRowErrors = (errors: { index: number; reasons: string[] }[]): void => {
  rowErrors.value = Object.fromEntries(
    errors.map((entry) => [entry.index, entry.reasons]),
  );
};

const formatSuccessMessage = (inserted: number, duplicates: number): string => {
  const parts: string[] = [];

  if (inserted > 0) {
    parts.push(`${inserted} saved`);
  }

  if (duplicates > 0) {
    parts.push(`${duplicates} duplicate${duplicates === 1 ? '' : 's'}`);
  }

  return parts.join(' · ');
};

const submit = async (): Promise<void> => {
  submitting.value = true;
  rowErrors.value = {};
  generalErrors.value = [];
  successMessage.value = null;
  clearSuccessTimer();

  try {
    const result = await createPositions(buildPayload());

    if (result.rejected > 0 || result.errors.length > 0) {
      applyRowErrors(result.errors);
      return;
    }

    successMessage.value = formatSuccessMessage(result.inserted, result.duplicates);

    successTimer = setTimeout(() => {
      emit('saved');
      emit('close');
    }, SUCCESS_TIMEOUT_MS);
  } catch (error) {
    const { errors, generalMessages } = parseCreatePositionsFailure(error);

    if (errors.length > 0) {
      applyRowErrors(errors);
    }

    generalErrors.value = generalMessages;
  } finally {
    submitting.value = false;
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    } else {
      clearSuccessTimer();
    }
  },
);

watch(
  () => props.vesselIds,
  (ids) => {
    if (!ids.includes(vesselId.value)) {
      vesselId.value = ids[0] ?? 0;
    }
  },
  { immediate: true },
);
</script>
