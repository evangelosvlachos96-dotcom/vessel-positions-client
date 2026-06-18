<template>
  <div
    class="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200"
  >
    <p class="font-medium">Something went wrong</p>
    <p class="mt-1 text-red-200/80">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>
