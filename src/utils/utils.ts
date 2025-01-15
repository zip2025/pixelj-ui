import {ref} from "vue";
import {type Media, Vote} from "./model.ts";

export const intervalFn = (intervalFn: () => void, interval = 5000, immediate = false) => {
    const active = ref<boolean>(false);
    let timer: ReturnType<typeof setInterval> | null = null;

    function reset() {
        if (timer) {
            clearInterval(timer)
            active.value = false;
            timer = null;
        }
    }

    function resume(immediateCallback = true) {
        if (active.value) return; // if already active we don't do anything
        if (interval <= 0) return; // not possible
        reset() // stop existing intervals if any
        if (immediateCallback) {
            intervalFn();
        }
        active.value = true
        timer = setInterval(intervalFn, interval);
    }

    function pause() {
        reset();
    }

    if (immediate) {
        resume();
    }

    return {
        pause, resume, active
    }
}

export const isVideo = (media?: Media) => {
    return media?.source.imageUrl.endsWith('.mp4') ?? false
}

export const voteFn = () => {
    const upVote = (media?: Media) => {
        if (media) {
            // Only upvote if not upvoted, otherwise reset to NONE
            const newVote = media.rating?.vote == Vote.UP ? Vote.NONE : Vote.UP
            patchVote(media, newVote)
        }
    }

    const downVote = (media?: Media) => {
        if (media) {
            // only downvote if not downvoted, otherwise reset to NONE
            const newVote = media.rating?.vote == Vote.DOWN ? Vote.NONE : Vote.DOWN;
            patchVote(media, newVote);
        }
    }

    const markFav = (media?: Media) => {
        if (media) {
            const fav = media.rating?.favourite ? !media.rating?.favourite : true
            patchFav(media, fav)
        }
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

    return {upVote, downVote, markFav}
}