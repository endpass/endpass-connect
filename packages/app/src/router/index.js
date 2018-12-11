import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

import Auth from '@/components/screens/Auth';
import Sign from '@/components/screens/Sign';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/auth',
      name: 'AuthScreen',
      component: Auth,
    },
    {
      path: '/sign',
      name: 'SignScreen',
      component: Sign,
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (to.name !== 'AuthScreen') {
    await store.dispatch('getAccounts');

    return store.getters.isAuthorized ? next() : next('auth');
  }

  return next();
});

export default router;
