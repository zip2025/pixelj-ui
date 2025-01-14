<script setup lang="ts">
import {type Media, type Page, nextPage, previousPage} from "../utils/model.ts";
import Thumbnail from "./Thumbnail.vue";

const emit = defineEmits<{
  (e: 'select', value: Media): void,
  (e: 'page', value: Page<Media>): void
}>()
const props = defineProps<{
  page: Page<Media>
}>()

const select = (media: Media) => {
  emit('select', media);
}

const navigateLeft = (p: Page) => {
  const newPage = previousPage(p);
  if (newPage.number != p.number) {
    emit('page', newPage);
  }
}

const navigateRight = (p: Page) => {
  const newPage = nextPage(p);
  if (newPage.number != p.number) {
    emit('page', newPage);
  }
}

</script>

<template>
  <div class="cursor" style="" @click="navigateLeft(page)" role="navigation" title="navigate to previous page">
    <i class="bi bi-chevron-compact-left bi-3x"></i>
  </div>
  <div class="thumbnails" v-for="media in props.page.content">
    <Thumbnail :value="media" @select="select"></Thumbnail>
  </div>
  <div class="cursor" style="" @click="navigateRight(page)" role="navigation" title="navigate to next page">
    <i class="bi bi-chevron-compact-right bi-3x"></i>
  </div>
</template>

<style scoped>

</style>