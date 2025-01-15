<script setup lang="ts">
import type {Media} from "../utils/model.ts";
import {ref} from "vue";

export type MediaComponentOptions = {
  loop?: boolean,
  autoplay?: boolean,
  autoscale?: boolean,
  showFullsizeIcon?: boolean
}

const props = defineProps<{
  media: Media,
  options?: MediaComponentOptions,
}>();

const autoplay = ref(props.options?.autoplay ?? true);
const loop = ref(props.options?.loop ?? true);
const autoscale = ref(props.options?.autoscale ?? true);
const showFullsizeIcon = ref(props.options?.showFullsizeIcon ?? false)

</script>

<template>
  <div :class="{'media-content': autoscale}">
    <a v-if="showFullsizeIcon && media.source.fullsizeUrl != ''"
       :href="'http://localhost:8080/api/media/' + media.id + '/fullsize'"
       target="_blank"
       class="btn btn-link"
       role="button"><i class="bi bi-cloud-download bi-3x"></i>
    </a>
    <video v-if="media.source.imageUrl.endsWith('.mp4')"
           :key="media.id"
           class="item-image-actual"
           draggable="true"
           controls
           height="100%"
           width="auto"
           :loop="loop"
           :autoplay="autoplay"
           preload="auto">
      <source :src="'http://localhost:8080/api/media/' + media.id">
    </video>
    <img v-else :src="'http://localhost:8080/api/media/' + media.id"
         draggable="true"
         style="max-height: 100%; width: auto; height: 100%"
         alt="image of media">
  </div>
</template>

<style scoped>
.media-content {
  display: flex;
  justify-content: center;
  height: calc(100vh - 300px);
  margin-top: 10px;
  margin-bottom: 10px;
  min-height: 100px;
}
</style>