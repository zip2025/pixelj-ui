<template>
  <div v-if="loading">LOADING....</div>
  <div class="container-fluid mx-2 mt-2">
    <div class="d-flex gap-4 mb-2">
      <div class="d-flex gap-0">
        <input type="text" @keyup.enter="event => updateTags(event.target.value)">
        <button class="btn btn-primary" @click="refresh">reload</button>
      </div>
    </div>

    Playback: {{activePlayback }}
    Timer: {{ timer.active }}
    Video: {{ video }}
    Media: {{ activeMedia?.id}}

    <div v-if="page.empty" class="">
      Keine Ergebnisse
    </div>

    <div>
      <i class="bi bi-play-fill bi-3x cursor" v-if="!activePlayback" @click="startPlay()"></i>
      <i class="bi bi-pause-fill bi-3x cursor" v-if="activePlayback" @click="pausePlay()"></i>
    </div>

    <div id="media-container" tabindex="1" v-on:keyup="keyup" v-if="!page.empty">
      <div class="w-100 d-flex align-items-center">
        <Thumbnails :page="page" :showLeft="false" :showRight="false" @select="selectMedia($event)"/>
      </div>
    </div>

    <div v-if="activeMedia">
      <MediaComponent :media="activeMedia" :options="{loop: false}"/>
    </div>
  </div>
</template>

<style scoped>

</style>

<script setup lang="ts">
import {nextTick, ref, watch, isProxy, toRaw} from "vue";
import Thumbnails from "./Thumbnails.vue";
import MediaComponent from "./MediaComponent.vue";
import {createPage, type Media, type Page, Queue} from "../utils/model.ts";
import {URLS} from "../utils/urls.ts";
import {intervalFn, isVideo} from "../utils/utils.ts";

const loading = ref<boolean>(false);
const activeMedia = ref<Media>();
const activePlayback = ref<boolean>(false);
const tags = ref<string>('');
const video = ref();
const queue = new Queue();
const page = ref<Page<Media>>(createPage<Media>(10));

const selectMedia = (media: any) => {
  // let's pause timer in this case
  timer.pause();
  if (isProxy(media)) {
    media = toRaw(media)
  }
  const index = queue.items.indexOf(media);
  if (index >= 0) {
    queue.currentIndex = index;
    activeMedia.value = queue.items[index];
    if (!isVideo(activeMedia.value) && activePlayback.value) {
        timer.resume();
    }
  }
}

const timer = intervalFn(async () => {
  if (queue.currentIndex == queue.items.length) {
    await refresh() // load new entries when we are near the end
  }
  const media = queue.nextItem();
  activeMedia.value = media;
  if (isVideo(media)) {
    timer.pause();
  }
});

const startPlay = () => {
  if (queue.items.length > 0 && !activeMedia.value) {
    activeMedia.value = queue.items[queue.currentIndex]
  }
  if (queue.items.length > 0) {
    activePlayback.value = true
    timer.resume();
  }
}

const pausePlay = () => {
  activePlayback.value = false
  timer.pause()
}

const updateTags = (input: string) => {
  tags.value = input;
  refresh()
}

const keyup = (event: any) => {
  if (loading.value) {
    // Bail if we are still loading
    return;
  }
  switch (event.key) {
    case 'a':
      // navigateLeft();
      break;
    case 'd':
      // navigateRight();
      break;
  }
}

const refresh = async () => {
  const query = tags.value.length == 0 ? '' : `tags=${tags.value}`
  loading.value = true;
  return fetch(`${URLS.queue}?size=${page.value.size}&${query.toString()}`)
      .then(result => result.json())
      .then((data: Page<Media>) => {
        page.value = data;
        if (data.last) {
          queue.reset();
        }
        queue.items.push(...data.content)
      })
      .finally(() => loading.value = false);
}

watch(() => activeMedia.value, (newMedia, oldMedia) => {
  if (isVideo(newMedia)) {
    console.log("New media is video, adding listener next tick");
    nextTick(() => {
      video.value = document.getElementsByTagName("video")[0]
      video.value.addEventListener("ended", () => {
        video.value.pause(); // in case we forgot to disable looping
        if (activePlayback.value && !timer.active) {
          console.log("Video ended. Triggering next item in queue")
          setTimeout(() => timer.resume(true), 1000);
        }
      })
    })
  }
})

</script>
