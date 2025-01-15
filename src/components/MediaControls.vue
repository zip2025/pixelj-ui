<script setup lang="ts">
import {type Media, Vote} from '../utils/model.ts'

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

const upVote = (media: Media) => {
  // Only upvote if not upvoted, otherwise reset to NONE
  const newVote = media.rating?.vote == Vote.UP ? Vote.NONE : Vote.UP
  patchVote(media, newVote)
}

const downVote = (media: Media) => {
  // only downvote if not downvoted, otherwise reset to NONE
  const newVote = media.rating?.vote == Vote.DOWN ? Vote.NONE : Vote.DOWN;
  patchVote(media, newVote);
}

const markFav = (media: Media) => {
  const fav = media.rating?.favourite ? !media.rating?.favourite : true
  patchFav(media, fav)
}

const patchFav = (media: Media, fav: boolean) => {
  const requestOptions = {
    method: 'PATCH',
    body: ''
  };
  fetch(`http://localhost:8080/api/media/${media.id}/vote?fav=${fav}`, requestOptions)
      .then(result => result.json())
      .then(rating => {
        if (media) {
          media.rating = rating;
        }
      });
}

const patchVote = (media: Media, vote: Vote) => {
  const requestOptions = {
    method: 'PATCH',
    body: ''
  };
  fetch(`http://localhost:8080/api/media/${media.id}/vote?vote=${vote}`, requestOptions)
      .then(result => result.json())
      .then(rating => {
        if (media) {
          media.rating = rating;
        }
      });
}

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
                    @click="upVote(media!)">
                <i class="bi bi-plus-circle bi-2x"></i>
              </span>
        <span class="cursor"
              :class="{'text-danger': media?.rating?.favourite}"
              @click="markFav(media!)">
                <i class="bi bi-2x"
                   :class="{'bi-heart-fill': media?.rating?.favourite,'bi-heart': !media?.rating?.favourite}"></i>
              </span>
        <span class="cursor"
              :class="{'text-primary': media?.rating?.vote == 'DOWN'}"
              @click="downVote(media!)">
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