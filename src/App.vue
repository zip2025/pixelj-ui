<script setup lang="ts">
import {RouterView} from 'vue-router'
</script>

<template>
  <nav>
    <RouterLink to="/rate">Go to Rate</RouterLink>
    <RouterLink to="/play">Go to Play</RouterLink>
  </nav>
  <RouterView/>
</template>

<style scoped>

</style>
