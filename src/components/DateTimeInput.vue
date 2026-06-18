<template>
  <div class="relative">
    <input
      type="datetime-local"
      step="1"
      :value="modelValue"
      :disabled="disabled"
      :class="[fieldClass, 'datetime-field', modelValue === '' ? 'date-input-empty' : '']"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span
      v-if="modelValue === ''"
      class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500"
    >
      {{ placeholder }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const fieldClass =
  'w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-slate-100 shadow-inner shadow-black/10 outline-none ring-1 ring-inset ring-white/10 transition focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-500/35 disabled:opacity-60';
</script>
