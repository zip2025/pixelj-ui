<script setup lang="ts">
import {onMounted, ref} from "vue";
import {URLS} from "../../utils/urls.ts";
import {Cache, type Media, type MediaFilter, type Page, Vote} from "../../utils/model.ts";
import Thumbnails from "../Thumbnails.vue";
import MediaComponent from "../MediaComponent.vue";
import Tags from "../Tags.vue";
import MediaControls from "../MediaControls.vue";
import {voteFn} from "../../utils/utils.ts";

const loading = ref<boolean>(true);
const selectedIndex = ref();
const selectedMedia = ref<Media>();
const muted = ref<boolean>(true);
const filter = ref<MediaFilter>({
  vote: Vote.NONE,
  source_promoted: false
});
const page = ref<Page<Media>>({
  first: true,
  empty: true,
  content: [],
  last: false,
  number: 0,
  totalPages: 0,
  size: 8,
  totalElements: 0
});
const voteService = voteFn();
const keyupDisabled = ref(false);

const keyup = (event: any) => {
  if (keyupDisabled.value) return;
  if (loading.value) {
    // Bail if we are still loading
    return;
  }
  switch (event.key) {
    case 'x':
      resetPage();
      break
    case 'q':
      muted.value = !muted.value
      break
    case 'w':
      voteService.upVote(selectedMedia.value)
        navigateRight()
      break;
    case 's':
      voteService.downVote(selectedMedia.value)
      navigateRight()
      break;
    case 'f':
      voteService.markFav(selectedMedia.value)
      break;
    case 'a':
      navigateLeft();
      break;
    case 'd':
      navigateRight();
  }
}

const select = (media: Media) => {
  selectedMedia.value = media;
  selectedIndex.value = page.value.content.indexOf(media);
};

const updatePage = (p: Page<Media>) => {
  page.value = p;
  reloadAndSelectFirst();
}

const nextPage = () => {
  page.value.number++;
  reloadAndSelectFirst()
}

const previousPage = () => {
  page.value.number--;
  reload((page) => {
    if (!page.empty) {
      select(page.content[page.size - 1])
    }
  });
}

const navigateLeft = () => {
  if (selectedMedia.value) {
    const currentIndex = selectedIndex.value;
    if (currentIndex == 0 && page.value.number > 0) {
      previousPage();
    } else if (currentIndex > 0) {
      select(page.value.content[currentIndex - 1]);
    }
  }
}

const navigateRight = () => {
  if (selectedMedia.value) {
    const currentIndex = selectedIndex.value
    if (currentIndex == page.value.size - 1 && page.value.number < page.value.totalPages) {
      nextPage();
    } else if (currentIndex < page.value.size - 1) {
      select(page.value.content[currentIndex + 1]);
    }
  }
}

const toggleFavourites = () => {
  filter.value.favourites = !filter.value.favourites
  page.value.number = 0
  reloadAndSelectFirst()
}

const toggleSourceFavourites = () => {
  filter.value.source_favourite = !filter.value.source_favourite
  page.value.number = 0
  reloadAndSelectFirst()
}

const setFilter = (vote: Vote) => {
  filter.value.vote = vote;
  page.value.number = 0
  reloadAndSelectFirst()
}

const togglePromoted = () => {
  filter.value.source_promoted = !filter.value.source_promoted
  page.value.number = 0
  reloadAndSelectFirst()
}

const addTag = (tag: string) => {
  if (!tag || tag.length < 3) return;

  const f = filter.value;
  if (!f.tags) {
    f.tags = [];
  }
  if (f.tags.indexOf(tag) == -1) {
    f.tags.push(tag);
  }
  page.value.number = 0
  reloadAndSelectFirst()
}

const removeTag = (tag: string) => {
  if (filter.value.tags) {
    const index = filter.value.tags.indexOf(tag);
    filter.value.tags.splice(index, 1)
  }
  page.value.number = 0
  reloadAndSelectFirst()
}

const clearFilter = () => {
  filter.value = {};
  cache.clear(createQuery(filter.value))
  reloadAndSelectFirst()
}

const resetPage = () => {
  page.value.number = 0;
  cache.clear('')
  reloadAndSelectFirst()
}

const createQuery = (filter: MediaFilter): string => {
  const params = new URLSearchParams()
  Object.keys(filter as any).forEach(key => {
    params.set(key, (filter as any)[key])
  })
  return params.toString()
}

const reloadAndSelectFirst = () => {
  reload((page) => {
    if (!page.empty) {
      select(page.content[0])
    }
  });
}

const reload = (consumer?: (page: Page<Media>) => void) => {
  const query = createQuery(filter.value)
  if (!cache.matchesId(query)) {
    console.log("Cache reset")
    cache.clear(query); // if the query changed, we have to reset the cache
  }
  if (cache.isCached(page.value)) {
    console.log("Cache hit")
    page.value = cache.getPage(page.value)
    if (consumer) {
      consumer(page.value)
    }
    return
  }
  loading.value = true;
  fetch(`${URLS.query}?start=${page.value.number}&size=${page.value.size}&${query.toString()}`)
      .then(result => result.json())
      .then((data: Page<Media>) => {
        data.content.forEach(it => {
          // sort tags, so most voted are first
          it.tags = it.tags.sort((a, b) => b.confidence - a.confidence)
        })
        page.value = data
        cache.addPage(data)
        if (consumer) {
          consumer(data)
        }
      })
      .finally(() => loading.value = false);
}

const toggleMute = () => {
  muted.value = !muted.value;
}

const cache = new Cache<Media>(createQuery(filter.value));

onMounted(() => {
  reload((page) => {
    if (!page.empty) {
      select(page.content[0])
    }
  })
})

</script>

<template>
  <div v-if="loading">LOADING....</div>
  <div class="container-fluid mx-2 mt-2" @keyup="keyup">
    <div class="d-flex gap-4 mb-2">
      <div class="d-flex gap-0">
        <i class="bi bi-volume-mute bi-2x cursor" @click="toggleMute()" v-if="muted"></i>
        <i class="bi bi-volume-up bi-2x cursor" @click="toggleMute()" v-if="!muted"></i>
        <button class="btn btn-sm btn-secondary" @click="toggleSourceFavourites()">Favourites (Source)</button>
        <button class="btn btn-sm btn-secondary" @click="togglePromoted()">{{filter.source_promoted ? 'New' : 'Top' }}</button>
        <button class="btn btn-sm btn-secondary" @click="toggleFavourites()">Favourites</button>
        <button class="btn btn-sm btn-secondary" @click="setFilter('UP')">UP</button>
        <button class="btn btn-sm btn-secondary" @click="setFilter('DOWN')">DOWN</button>
        <button class="btn btn-sm btn-secondary" @click="setFilter('NONE')">NONE</button>
        <button class="btn btn-sm btn-secondary" @click="clearFilter()">clear</button>

        <input type="text"
               @focusin="keyupDisabled = true"
               @focusout="keyupDisabled = false"
               @keyup.enter="event => addTag(event.target.value)">
        <div class="d-flex gap-2">
          <span v-for="filterTag in filter.tags">
            {{ filterTag }}
            <button class="btn btn-link btn-sm text-danger" @click="removeTag(filterTag)">X</button>
          </span>
        </div>
      </div>
      <div class="col-6">
        <div class="d-flex">
          <div>{{ createQuery(filter) }}</div>
          <div class="bg-light d-flex gap-2 mx-4">
            <div>Index: {{ selectedIndex }}</div>
            <div>Page: {{ page.number + 1 }} / {{ page.totalPages }}</div>
            <div>
              <button class="btn btn-sm btn-link" @click="resetPage()">Reset Page</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="page.empty" class="">
      Keine Ergebnisse
    </div>

    <div id="media-container" tabindex="1" v-if="!page.empty">
      <div class="w-100 d-flex align-items-center">
        <Thumbnails :page="page" @select="select" @page="updatePage"/>
        <MediaControls
            v-if="selectedMedia"
            :media="selectedMedia"
            @left="navigateLeft"
            @right="navigateRight"
        />
        <Tags v-if="selectedMedia" :media="selectedMedia" @clicked="addTag($event.tag)"/>
      </div>

      <div v-if="selectedMedia" class="media-content">
        <MediaComponent :media="selectedMedia" :options="{muted: muted}"/>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>