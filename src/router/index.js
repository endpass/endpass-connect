import { isEmpty } from 'lodash';
import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

import Bridge from '@/components/Bridge';
import Auth from '@/components/screens/Auth';
import Sign from '@/components/screens/Sign';
import User from '@/components/screens/User';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'User',
      component: User,
    },
    {
      path: '/bridge',
      name: 'Bridge',
      component: Bridge,
    },
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
  const isPublicRoute = ['AuthScreen', 'Bridge'].includes(to.name);

  if (!isPublicRoute) {
    await store.dispatch('getAccounts');
    await store.dispatch('getSettings');

    return !isEmpty(store.state.accounts.accounts) ? next() : next('auth');
  }

  return next();
});

export default router;
