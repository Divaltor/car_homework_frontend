import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  theme: {
    'border-radius-base': '4px',
    'primary-color': '#8764b8',
  },
  routes: [
    {
      exact: false,
      path: '/',
      component: '@/layouts/App',
      routes: [
        { path: '/', component: '@/pages/index' },
        { path: '/login', component: '@/pages/login', wrappers: ['@/wrappers/logged'] },
        { path: '/users', component: '@/pages/users/index', wrappers: ['@/wrappers/auth'] },
        { path: '/vehicle/:id/rent', component: '@/pages/vehicles/[id]', wrappers: ['@/wrappers/auth'] }
      ],
    },

  ],
  fastRefresh: {},
});
