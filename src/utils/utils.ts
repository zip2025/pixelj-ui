import {ref} from "vue";
import type {Media} from "./model.ts";

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