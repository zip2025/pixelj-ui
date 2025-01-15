<script setup lang="ts">
import {type Media} from '../utils/model.ts'
import {voteFn} from '../utils/utils.ts'

defineProps<{
      media?: Media,
}>()

const emits = defineEmits<{
  (e: 'left'): void
  (e: 'right'): void
}>();

const clickedLeft = () => {
  emits('left')
}

const clickedRight = () => {
  emits('right')
}

const voteService = voteFn();

const open = (media: Media) => {
  window.open(`http://localhost:8080/api/media/${media.id}/fullsize`)
}

</script>

<template>
  <div v-if="media">
    <!-- Rating -->
    <div class="d-flex flex-row">
      <div class="h2 p-0 d-flex gap-4 mx-4">
              <span class="cursor"
                    :class="{'text-primary': media.rating?.vote == 'UP'}"
                    @click="voteService.upVote(media!)">
                <i class="bi bi-plus-circle bi-2x"></i>
              </span>
        <span class="cursor"
              :class="{'text-danger': media?.rating?.favourite}"
              @click="voteService.markFav(media!)">
                <i class="bi bi-2x"
                   :class="{'bi-heart-fill': media?.rating?.favourite,'bi-heart': !media?.rating?.favourite}"></i>
              </span>
        <span class="cursor"
              :class="{'text-primary': media?.rating?.vote == 'DOWN'}"
              @click="voteService.downVote(media!)">
                <i class="bi bi-dash-circle bi-2x"></i>
              </span>
      </div>
    </div>
    <div class="d-flex justify-content-between mx-4">
      <span class="cursor" @click="clickedLeft"><i class="bi bi-arrow-left bi-2x"></i></span>
      <span v-if="media.source.fullsizeUrl != ''"
            class="cursor"
         @click="open(media)"
         role="link"><i class="bi bi-floppy bi-2x"></i>
      </span>
      <span class="cursor" @click="clickedRight"><i class="bi bi-arrow-right bi-2x"></i></span>
    </div>
  </div>
</template>

<style scoped>

</style>