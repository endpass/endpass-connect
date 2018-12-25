<template>
  <v-frame :loading="!inited">
    <logout-form 
      :loading="loading"
      :closable="isDialog"
      @submit="handleLogoutSubmit"
      @cancel="handleLogoutCancel"
    /> 
  </v-frame> 
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import VFrame from '../VFrame.vue';
import LogoutForm from '../LogoutForm.vue';

export default {
  name: 'Authorized',

  computed: {
    ...mapState({
      inited: state => state.core.inited,
      loading: state => state.core.loading,
    }),
    ...mapGetters(['isDialog']),
  },

  methods: {
    ...mapActions(['init', 'logout', 'cancelLogout', 'sendReadyMessage']),

    async handleLogoutSubmit() {
      this.logout();
    },

    handleLogoutCancel() {
      this.cancelLogout();
    },

    handleWindowClose() {
      this.cancelLogout();
    },
  },

  async created() {
    await this.init();

    if (this.isDialog) {
      window.addEventListener('beforeunload', this.handleWindowClose);

      await this.sendReadyMessage();
    }
  },

  components: {
    VFrame,
    LogoutForm,
  },
};
</script>
