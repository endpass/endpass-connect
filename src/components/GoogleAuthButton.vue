<template lang="html">
  <v-button
      v-if="auth2Loaded"
      @click="loginWithGoogle"
      :submit="false"
      type="primary"
      data-test="submit-button"
    >Log in with google</v-button>
</template>

<script>
import router from '@/router';
import { mapActions } from 'vuex';
import VButton from './VButton.vue';

export default {
  data() {
    let gapi = window.gapi;
    return {
      auth2Loaded: false,
      gapi,
    };
  },
  methods: {
    ...mapActions([
      'authWithGoogle',
      'awaitAuthConfirm',
      'confirmAuth',
      'handleAuthError',
    ]),
    async loginWithGoogle() {
      let auth = gapi.auth2.init({
        client_id: ENV.google.key,
        scope: 'profile',
      });
      await auth.signIn().then(function() {});
      try {
        await this.authWithGoogle({
          email: auth.currentUser.get().getBasicProfile().getEmail,
          idToken: auth.currentUser.get().getAuthResponse().id_token,
        });
        await this.awaitAuthConfirm();
        await this.confirmAuth();
        this.$router.push({ path: '/' });
      } catch (err) {
        console.error(err);
        this.handleAuthError(err);
      }
    },
    loadAuth2() {
      this.gapi.load('auth2', () => {
        this.auth2Loaded = true;
      });
    },
    initGoogle() {
      if (this.gapi) {
        this.loadAuth2();
      } else {
        let unwatch = this.$watch(
          () => window.gapi,
          () => {
            this.initGoogle();
            this.unwatch();
          },
        );
      }
    },
  },
  created() {
    this.initGoogle();
  },
  components: {
    VButton,
  },
};
</script>

<style lang="css">
</style>
