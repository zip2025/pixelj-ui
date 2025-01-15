import 'bootstrap/dist/js/bootstrap';
import './scss/main.scss'
import {createApp} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import App from './App.vue'
import RateView from "./components/views/RateView.vue";
import PlayView from "./components/views/PlayView.vue";

const app = createApp(App)

const router = createRouter({
    linkActiveClass: 'active',
    history: createWebHistory(),
    routes: [
        {path: '/rate', component: RateView},
        {path: '/play', component: PlayView},
        {path: '/', redirect: '/rate'}
    ],
})

app.use(router)
app.mount("#app")