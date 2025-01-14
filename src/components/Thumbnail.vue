<script setup lang="ts">
import type {Media} from "@/utils/model.ts";
import {ref, watch} from "vue";

const props = defineProps<{
  value: Media
}>()

const emit = defineEmits<{
  (e: 'select', value: Media): void
}>()

const select = (media: Media) => {
  emit('select', media);
}

const showImage = ref(false);

const onLoad = (element: any) => {
  showImage.value = true;
}

const onError = (element: any) => {
  element.target.src = 'https://placehold.co/100?text=X'
  element.error = null;
}

watch(() => props.value, (oldValue, newValue) => {
  if (oldValue.id != newValue.id) {
    showImage.value = false;
  }
})

</script>

<template>
  <div class="thumbnail cursor" @click="select(value)">
    <div v-if="!showImage" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <img
        :key="value.id"
        :alt="value?.tags[0]?.tag"
         style="max-height: 100%; width:100%; height: 100%"
         v-show="showImage"
         @load="onLoad"
         @error="onError"
         :src="`http://localhost:8080/api/media/${value.id}/thumbnail`"
    />
  </div>
</template>

<style scoped>
.thumbnail {
  margin: 0px 2px 2px 0px;
  display: inline-block;
  width: 128px;
  height: 128px;
}
</style>