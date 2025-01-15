<script setup lang="ts">
import {type Media, type Page, nextPage, previousPage} from "../utils/model.ts";
import Thumbnail from "./Thumbnail.vue";

const emit = defineEmits<{
  (e: 'select', value: Media): void,
  (e: 'page', value: Page<Media>): void
}>()

defineProps<{
  page: Page<Media>
  showLeft?: boolean,
  showRight?: boolean
}>()

const select = (media: Media) => {
  emit('select', media);
}

const navigateLeft = (p: Page<Media>) => {
  const newPage = previousPage(p);
  if (newPage.number != p.number) {
    emit('page', newPage);
  }
}

const navigateRight = (p: Page<Media>) => {
  const newPage = nextPage(p);
  if (newPage.number != p.number) {
    emit('page', newPage);
  }
}

</script>

<template>
  <div v-if="showLeft"
      class="cursor" style="" @click="navigateLeft(page)" role="navigation" title="navigate to previous page">
    <i class="bi bi-chevron-compact-left bi-3x"></i>
  </div>
  <div class="thumbnails" v-for="media in page.content">
    <Thumbnail :value="media" @select="select"></Thumbnail>
  </div>
  <div v-if="showRight"
      class="cursor" style="" @click="navigateRight(page)" role="navigation" title="navigate to next page">
    <i class="bi bi-chevron-compact-right bi-3x"></i>
  </div>
</template>

<style scoped>

</style>