<script setup lang="ts">
import {isProxy, ref, toRaw, watch} from "vue";
import {type Media, type MediaTag} from '../utils/model.ts'
import Tag from "./Tag.vue";
import DateComponent from "./DateComponent.vue";

const props = defineProps<{
  media?: Media
}>();

const emits = defineEmits<{
  (e: 'clicked', value: MediaTag): void
}>()

const TAG_SIZE = 10;
const tags = ref<MediaTag[]>(props.media ? [...new Set(props.media.tags)] : []);
const showAll = ref<boolean>(false);
const hasMore = ref<boolean>(tags.value.length > TAG_SIZE);

watch(() => props.media, (newMedia, oldMedia) => {
  if (isProxy(newMedia)) {
    newMedia = toRaw(newMedia);
  }
  if (newMedia) {
    tags.value = [...new Set(newMedia.tags)]
  } else {
    tags.value = [];
  }
  hasMore.value = tags.value.length > TAG_SIZE;
})

const navigateTo = (url: string, target: string) => {
  window.open(url, target);
}

const clicked = (tag: MediaTag) => {
  emits("clicked", tag)
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
      <Tag :value="tag.tag" v-for="(tag, index) in tags" @click="clicked(tag)"
        :class="{'d-none': index > 5 && !showAll}"
      />
      <span class="link-primary" v-if="hasMore && showAll" @click="showAll = !showAll" role="link">einklappen...</span>
      <span class="link-primary" v-if="hasMore && !showAll" @click="showAll = !showAll" role="link">{{ tags.length - 5}} weitere anzeigen anzeigen</span>
    </div>
  </div>
</template>

<style scoped>

</style>