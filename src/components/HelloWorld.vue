<template>
  <div v-if="loading">LOADING....</div>
  <div class="container-fluid mx-2 mt-2">
    <div class="row">
      <div class="col-6">
        <button class="btn btn-sm btn-secondary" @click="toggleFavourites()">Favourites</button>
        <button class="btn btn-sm btn-secondary" @click="toggleRated()">Rated</button>
        <button class="btn btn-sm btn-secondary" @click="toggleUnrated()">Unrated</button>
        <button class="btn btn-sm btn-secondary" @click="clearFilter()">Clear</button>
        <button class="btn btn-sm btn-secondary" @click="togglePromoted()">{{
            filter.promoted ? 'New' : 'Top'
          }}
        </button>
      </div>
      <div class="col-6">
        <pre>{{ pretty(filter) }}</pre>
      </div>
    </div>

    <div class="w-100 d-flex align-items-center" id="media-container">
      <div class="media-preview" v-for="media in page.content" @click="select(media)">
        <img style="max-height: 100%; width:100%; height: 100%"
             :src="'http://localhost:8080/api/media/' + media.id + '/thumbnail'">
      </div>
      <div class="bg-light d-flex flex-column gap-2 mx-4">
        <div>Index: {{ selectedIndex }}</div>
        <div>Page: {{ page.number + 1 }} / {{ page.totalPages }}</div>
        <div><button class="btn btn-sm btn-link" @click="resetPage()">Reset Page</button></div>
      </div>
    </div>

    <div v-if="selectedMedia" class="media-content">
      <video v-if="selectedMedia.contentPath.endsWith('.mp4')"
             :key="selectedMedia.id"
             class="item-image-actual"
             draggable="true"
             controls
             height="100%"
             width="auto"
             loop=""
             autoplay=""
             preload="auto">
        <source :src="'http://localhost:8080/api/media/' + selectedMedia.id">
      </video>
      <img v-else :src="'http://localhost:8080/api/media/' + selectedMedia.id"
           draggable="true"
           style="max-height: 100%; width: auto; height: 100%"
           alt="image of media">
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
            <i class="bi" :class="{'bi-heart-fill': selectedMedia?.rating?.favourite,'bi-heart': !selectedMedia?.rating?.favourite}"></i>
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
          <a target="_blank" class="text-bg-danger" :href="'https://pr0gramm.com/new/' + selectedMedia.ref.id">id: {{ selectedMedia.ref.id }}</a>
        </span>
        </div>
        <!-- Tags -->
        <div class="d-flex flex-wrap gap-2">
        <span v-for="tag in selectedMedia.tags" class="badge rounded-pill text-bg-secondary">
        {{ tag.tag }}
        </span>
        </div>
      </div>
    </div>
    <div v-if="selectedMedia" class="bg-light">
      <pre class="text-sm">{{ pretty(selectedMedia) }}</pre>
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

.media-preview {
  margin: 0px 2px 2px 0px;
  display: inline-block;
  width: 128px;
  height: 128px;
}
</style>

<script setup lang="ts">
import {URLS} from "../utils/urls.ts";
import {Cache, type Media, type Page, Vote} from "../utils/model.ts";
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();

const loading = ref<boolean>(true);
const selectedIndex = ref();
const selectedMedia = ref<Media>();
const filter = ref<{ [key: string]: any }>({promoted: false});
const page = ref<Page<Media>>({
  first: true,
  empty: true,
  content: [],
  last: false,
  number: 0,
  totalPages: 0,
  size: 10,
  totalElements: 0
});

window.addEventListener("keyup", (e) => {
  if (loading.value) {
    // Bail if we are still loading
    return;
  }
  switch (e.key) {
    case 'w':
      if (selectedMedia.value) {
        upVote(selectedMedia.value)
      }
      break;
    case 's':
      if (selectedMedia.value) {
        downVote(selectedMedia.value)
      }
      break;
    case 'f':
      if (selectedMedia.value) {
        markFav(selectedMedia.value)
      }
      break;
    case 'a':
      navigateLeft();
      break;
    case 'd':
      navigateRight();
  }
});

const pretty = (input: any) => {
  return JSON.stringify(input, null, 2);
}

const select = (media: Media) => {
  // selectedMedia.value = null;
  selectedMedia.value = media;
  selectedIndex.value = page.value.content.indexOf(media);
};

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
        if (selectedMedia.value && selectedMedia.value.rating) {
          selectedMedia.value.rating = rating;
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
        if (selectedMedia.value) {
          selectedMedia.value.rating = rating;
        }
      });
}

const nextPage = () => {
  page.value.number++;
  reload((page) => {
    select(page.content[0])
  });
}

const previousPage = () => {
  page.value.number--;
  reload((page) => {
    select(page.content[page.size - 1])
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
  if (filter.value['favouritesOnly'] == undefined) {
    filter.value.favouritesOnly = true;
  } else {
    filter.value.favouritesOnly = !filter.value.favouritesOnly;
  }
  page.value.number = 0
  reload((page) => select(page.content[0]))
}

const toggleRated = () => {
  if (filter.value['rated'] == undefined) {
    filter.value.rated = true;
  } else {
    filter.value.rated = !filter.value.rated;
  }
  page.value.number = 0
  reload((page) => select(page.content[0]))
}

const toggleUnrated = () => {
  if (filter.value['unrated'] == undefined) {
    filter.value.unrated = true;
  } else {
    filter.value.unrated = !filter.value.unrated;
  }
  page.value.number = 0
  reload((page) => select(page.content[0]))
}

const togglePromoted = () => {
  if (filter.value['promoted'] == undefined) {
    filter.value['promoted'] = false;
  } else {
    filter.value.promoted = !filter.value.promoted;
  }
  page.value.number = 0
  reload((page) => select(page.content[0]))
}

const clearFilter = () => {
  filter.value = {};
  reload((page) => select(page.content[0]))
}

const resetPage = () => {
  page.value.number = 0;
  reload((page) => select(page.content[0]))
}

const createQuery = (filter: {[key: string] : any}): string => {
  const params = new URLSearchParams()
  Object.keys(filter as any).forEach(key => {
    params.set(key, (filter as any)[key])
  })
  return params.toString()
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
  router.isReady().then(() => {
    if (route.path != '/') {
      filter.value.id = route.path.substring(1)
    }
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
  });
})

</script>
