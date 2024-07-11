import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Dashboard from '../components/Conversation.vue'

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login
    },
    {
        path: '/conversation',
        name: 'Conversation',
        component: Dashboard
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
