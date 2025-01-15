<template>
  <div v-if="loading">LOADING....</div>
  <div class="container-fluid mx-2 mt-2">
    <div class="d-flex gap-4 mb-2">
      <div class="d-flex gap-0">
        <button class="btn btn-sm btn-secondary" @click="toggleFavourites()">Favourites</button>
        <button class="btn btn-sm btn-secondary" @click="toggleRated()">Rated</button>
        <button class="btn btn-sm btn-secondary" @click="toggleUnrated()">Unrated</button>
        <button class="btn btn-sm btn-secondary" @click="clearFilter()">Clear</button>
        <button class="btn btn-sm btn-secondary" @click="togglePromoted()">{{
            filter.source_promoted ? 'New' : 'Top'
          }}
        </button>
        <input type="text"
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

    <div id="media-container" tabindex="1" v-on:keyup="keyup" v-if="!page.empty">
      <div class="w-100 d-flex align-items-center">
        <Thumbnails :page="page" @select="select" @page="updatePage"/>
        <MediaControls
            v-if="selectedMedia"
            :media="selectedMedia"
            @left="navigateLeft"
            @right="navigateRight"
        />
        <Tags v-if="selectedMedia" :media="selectedMedia" />
      </div>

      <div v-if="selectedMedia" class="media-content">
        <MediaComponent :media="selectedMedia" />
      </div>
    </div>
    <div v-if="selectedMedia" class="">
      <!-- Rating -->
      <div class="h2 p-0 d-flex gap-4 m-4">
          <span class="cursor"
                :class="{'text-primary': selectedMedia?.rating?.vote == 'UP'}"
                @click="upVote(selectedMedia!)">
            <i class="bi bi-plus-circle"></i>
          </span>
        <span class="cursor"
              :class="{'text-danger': selectedMedia?.rating?.favourite}"
              @click="markFav(selectedMedia!)">
              <i class="bi"
                 :class="{'bi-heart-fill': selectedMedia?.rating?.favourite,'bi-heart': !selectedMedia?.rating?.favourite}"></i>
          </span>
        <span class="cursor"
              :class="{'text-primary': selectedMedia?.rating?.vote == 'DOWN'}"
              @click="downVote(selectedMedia!)">
            <i class="bi bi-dash-circle"></i>
          </span>
      </div>

      <div>
        <!-- Original Id -->
        <div class="d-flex gap-2">
          <span class="badge rounded-pill text-bg-danger">
            <a target="_blank" class="text-bg-danger"
               :href="'https://pr0gramm.com/new/' + selectedMedia.ref.id">id: {{ selectedMedia.ref.id }}</a>
          </span>
        </div>
        <!-- Tags -->
        <div class="d-flex flex-wrap gap-2">
          <span v-for="tag in selectedMedia.tags"
                class="badge rounded-pill text-bg-secondary cursor" @click="addTag(tag.tag)">
          {{ tag.tag }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="selectedMedia" class="bg-light">
      <pre class="text-sm">{{ pretty(selectedMedia) }}</pre>
    </div>
  </div>
</template>

<style scoped>

</style>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {URLS} from "../utils/urls.ts";
import {Cache, type Media, type Page} from "../utils/model.ts";
import Thumbnails from "./Thumbnails.vue";
import MediaComponent from "./MediaComponent.vue";
import Tags from "./Tags.vue";
import MediaControls from "./MediaControls.vue";


const loading = ref<boolean>(true);
const selectedIndex = ref();
const selectedMedia = ref<Media>();
const filter = ref<{ [key: string]: any }>({source_promoted: false});
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

// const keyup = (event: any) => {
//   if (loading.value) {
//     // Bail if we are still loading
//     return;
//   }
//   switch (event.key) {
//     case 'w':
//       if (selectedMedia.value) {
//         upVote(selectedMedia.value)
//       }
//       break;
//     case 's':
//       if (selectedMedia.value) {
//         downVote(selectedMedia.value)
//       }
//       break;
//     case 'f':
//       if (selectedMedia.value) {
//         markFav(selectedMedia.value)
//       }
//       break;
//     case 'a':
//       navigateLeft();
//       break;
//     case 'd':
//       navigateRight();
//   }
// }

const pretty = (input: any) => {
  return JSON.stringify(input, null, 2);
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
  if (filter.value['source_favourite'] == undefined) {
    filter.value.source_favourite = true;
  } else {
    filter.value.source_favourite = !filter.value.source_favourite;
  }
  page.value.number = 0
  reloadAndSelectFirst()
}

const toggleRated = () => {
  if (filter.value['rated'] == undefined) {
    filter.value.rated = true;
  } else {
    filter.value.rated = !filter.value.rated;
  }
  page.value.number = 0
  reloadAndSelectFirst()
}

const toggleUnrated = () => {
  if (filter.value['unrated'] == undefined) {
    filter.value.unrated = true;
  } else {
    filter.value.unrated = !filter.value.unrated;
  }
  page.value.number = 0
  reloadAndSelectFirst()
}

const togglePromoted = () => {
  if (filter.value['source_promoted'] == undefined) {
    filter.value['source_promoted'] = false;
  } else {
    filter.value.source_promoted = !filter.value.source_promoted;
  }
  page.value.number = 0
  reloadAndSelectFirst()
}

const addTag = (tag: string) => {
  if (!tag || tag.length < 3) return;
  if (!filter.value.tags) {
    filter.value.tags = []
  }
  if (filter.value.tags) {
    if (filter.value.tags.indexOf(tag) == -1) {
      filter.value.tags.push(tag);
    }
  }
  page.value.number = 0
  reloadAndSelectFirst()
}

const removeTag = (tag: string) => {
  if (filter.value.tags) {
    const index = filter.value.tags.indexOf(tag);
    filter.value.tags.splice(index, 1)
    if (filter.value.tags.length == 0) {
      delete filter.value['tags']
    }
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

const createQuery = (filter: { [key: string]: any }): string => {
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


const cache = new Cache<Media>(createQuery(filter.value));

onMounted(() => {
  // router.isReady().then(() => {
    // TODO MVR this is no longer working
    // if (route.path != '/rate') {
    //   console.log(route.path)
    //   filter.value.id = route.path.substring(1)
    // }
    reload((page) => {
      if (!page.empty) {
        if (filter.value['id']) {
          const item = page.content.find(it => it.id == filter.value['id'])
          if (item) {
            select(item)
          } else {
            select(page.content[0])
          }
          delete filter.value['id']
        } else {
          select(page.content[0])
        }
      }
    })
  // });
})

</script>
