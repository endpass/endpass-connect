<template>
  <v-button
    :href="
      `https://github.com/login/oauth/authorize?scope=user:email&client_id=${appId}`
    "
  >
    <v-icon><img src="@/img/github.svg"/></v-icon>
  </v-button>
</template>

<script>
import VButton from './VButton.vue';
import VIcon from '@/components/VIcon';

export default {
  data() {
    return {
      appId: ENV.git.appId,
    };
  },
  components: {
    VButton,
    VIcon,
  },
};
</script>
