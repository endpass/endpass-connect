<template>
  <v-button
    :href="
      `https://github.com/login/oauth/authorize?scope=user:email&client_id=${appId}`
    "
  >
    <v-svg-icon name="github" width="30px" height="30px" />
  </v-button>
</template>

<script>
import VButton from '@/components/VButton';
import VSvgIcon from '@/components/VSvgIcon';

export default {
  data() {
    return {
      appId: ENV.gitClientId,
    };
  },
  components: {
    VButton,
    VSvgIcon,
  },
};
</script>
