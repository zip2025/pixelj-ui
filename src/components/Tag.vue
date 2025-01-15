<script setup lang="ts">

const props = defineProps<{
  value: string,
  prefix?: string,
  color?: 'danger'|'secondary'|'primary'
}>()

const clazz = `text-bg-${props.color??'secondary'}`

</script>

<template>
<span class="badge rounded-pill cursor" :class="clazz">{{ props.value }}</span>
</template>

<style scoped>

</style>