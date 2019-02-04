<template>
  <v-frame :loading="!gitLoded">
    <message v-if="error" data-test="git-error-message" :error="true">{{errorMessage}}</message>
    <form-controls>
      <router-link to="/auth">
        <a>Try again</a>
      </router-link>
    </form-controls>
  </v-frame>
</template>

<script>
import VFrame from '../VFrame.vue';
import Message from '../Message.vue';
import FormControls from '../FormControls.vue';
import { mapActions } from 'vuex';

export default {
  name: 'AuthGit',
  data() {
    return {
      gitLoded: false,
      error: false,
      errorMessage: '',
    };
  },
  methods: {
    ...mapActions(['authWithGitHub']),
    handleAuthError(error) {
      this.error = true;
      this.errorMessage = error.message || 'Unexpected error, try login later';
      this.gitLoded = true;
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
