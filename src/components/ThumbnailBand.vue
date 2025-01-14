<script setup lang="ts">
import type {Media, Page} from "@/utils/model.ts";
import Thumbnail from "./Thumbnail.vue";

const emit = defineEmits<{
  (e: 'select', value: Media): void
}>()
const props = defineProps<{
  page: Page<Media>
}>()

const select = (media: Media) => {
  emit('select', media);
}

</script>

<template>
  <div class="thumbnails" v-for="media in props.page.content">
    <Thumbnail :value="media" @select="select"></Thumbnail>
  </div>

</template>

<style scoped>

</style>