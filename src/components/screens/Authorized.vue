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
    ...mapActions(['logout', 'cancelLogout']),

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
    if (this.isDialog) {
      window.addEventListener('beforeunload', this.handleWindowClose);
    }
  },

  components: {
    VFrame,
    LogoutForm,
  },
};
</script>
