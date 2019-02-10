<template lang="html">
  <v-button
    :disabled="!auth2Loaded"
    :submit="false"
    data-test="submit-button"
    @click="loginWithGoogle"
  >
    <v-svg-icon name="google" width="30px" height="30px" />
  </v-button>
</template>

<script>
import router from '@/router';
import { mapActions } from 'vuex';
import VButton from '@/components/VButton';
import VSvgIcon from '@/components/VSvgIcon';

export default {
  data() {
    const gapi = window.gapi;
    return {
      auth2Loaded: false,
      gapi,
    };
  },
  methods: {
    ...mapActions(['authWithGoogle']),
    async loginWithGoogle() {
      const auth = gapi.auth2.init({
        client_id: ENV.googleClientId,
        scope: 'profile',
      });
      await auth.signIn();
      try {
        await this.authWithGoogle({
          email: auth.currentUser
            .get()
            .getBasicProfile()
            .getEmail(),
          idToken: auth.currentUser.get().getAuthResponse().id_token,
        });
        this.$router.push({ path: '/' });
      } catch (err) {
        console.error(err);
        this.handleAuthError(err);
      }
    },
    handleAuthError(err) {
      this.$emit('error', err);
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
        const unwatch = this.$watch(
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
    VSvgIcon,
  },
};
</script>
