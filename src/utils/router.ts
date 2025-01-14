import {createRouter, createWebHistory} from 'vue-router'
// import SignupView from "@/views/SignupView.vue";
// import LoginView from "@/views/LoginView.vue";
// import ForgotPasswordView from "@/views/ForgotPasswordView.vue";
// import PackView from "@/views/app/PackView.vue";
// import GearView from "@/views/app/GearView.vue";
// import PackListViewer from "@/components/PackListViewer.vue";

const router = createRouter({
    linkActiveClass: 'active',
    linkExactActiveClass: 'exact-active',
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: []
//     // TODO MVR => add home view and also load all components lazy
//     routes: [
//         {
//             path: '/s/:id',
//             component: PackListViewer
//         },
//         {
//             path: '/',
//             redirect: '/login'
//         },
//         {
//             path: '/signup',
//             component: SignupView
//         },
//         {
//             path: '/login',
//             component: LoginView
//         },
//         {
//             path: '/forgot-password',
//             name: 'forgot-password',
//             component: ForgotPasswordView
//         },
//         {
//             path: '/app',
//             redirect: '/app/gear',
//             component: () => import('../views/AppView.vue'),
//             children: [
//                 {
//                     path: 'gear',
//                     component: GearView
//                 },
//                 {
//                     path: 'lists',
//                     component: PackView
//                 }
//             ]
//         }
//     ]
})

export default router
