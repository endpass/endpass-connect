<template>
  <v-frame :loading="!gitLoaded" :closable="false">
    <message v-if="error" :error="true" data-test="git-error-message">{{
      errorMessage
    }}</message>
    <form-controls>
      <router-link to="/auth">
        <a>Try again</a>
      </router-link>
    </form-controls>
  </v-frame>
</template>

<script>
import { mapActions } from 'vuex';
import VFrame from '../VFrame.vue';
import Message from '../Message.vue';
import FormControls from '../FormControls.vue';

export default {
  name: 'AuthGit',
  data() {
    return {
      gitLoaded: false,
      error: false,
      errorMessage: '',
    };
  },
  methods: {
    ...mapActions(['authWithGitHub']),
    handleAuthError(error) {
      this.error = true;
      this.errorMessage = error.message || 'Unexpected error, try login later';
      this.gitLoaded = true;
    },
  },
  async created() {
    try {
      await this.authWithGitHub(this.$route.query.code);
      this.$router.push({ path: '/' });
    } catch (err) {
      this.handleAuthError(err);
    }
  },
  components: {
    Screen,
    VFrame,
    Message,
    FormControls,
  },
};
</script>
