<script setup lang="ts">
defineProps<{
  dates: number[]
}>();

</script>

<template>
<span>{{dates[0]}}-{{dates[1]}}-{{ dates[2]}}</span>
</template>

<style scoped>

</style>