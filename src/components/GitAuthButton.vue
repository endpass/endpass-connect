<template>
  <v-button class="primary" :href="`https://github.com/login/oauth/authorize?scope=user:email&client_id=${appId}`">Log in with GitHub</v-button>
</template>

<script>
import VButton from './VButton.vue';

export default {
  data() {
    return {
      appId: ENV.git.appId,
    };
  },
  components: {
    VButton,
  },
};
</script>
