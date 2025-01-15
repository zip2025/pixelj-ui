<script setup lang="ts">
import {computed, isProxy, ref, toRaw, watch} from "vue";
import {type Media, type MediaTag} from '../utils/model.ts'
import Tag from "./Tag.vue";
import DateComponent from "./DateComponent.vue";

const props = defineProps<{
  media?: Media
}>();

const tags = ref<MediaTag[]>(props.media ? [...new Set(props.media.tags)] : []);

watch(() => props.media, (newMedia, oldMedia) => {
  if (isProxy(newMedia)) {
    newMedia = toRaw(newMedia);
  }
  if (newMedia) {
    tags.value = [...new Set(newMedia.tags)]
  } else {
    tags.value = [];
  }
})

const navigateTo = (url: string, target: string) => {
  window.open(url, target);
}

</script>

<template>
  <div v-if="media">
    <!-- Original Id -->
    <Tag :value="`id ${media.ref.id}`"
         class="mb-2"
         :color="'danger'"
         @click="navigateTo(`https://pr0gramm.com/new/${media.ref.id}`,'_blank'); "/>
    <DateComponent :dates="media.creationTime" class="ms-2 mb-2 font-monospace text-small"/>
    <!-- Tags -->
    <div class="d-flex flex-wrap gap-2">
      <Tag :value="tag.tag" v-for="tag in tags"/>
    </div>
  </div>
</template>

<style scoped>

</style>