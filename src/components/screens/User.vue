<template>
  <screen>
    <v-frame :loading="!inited">
      <logout-form 
        :loading="loading"
        :closable="isDialog"
        @submit="handleLogoutSubmit"
        @cancel="handleLogoutCancel"
      /> 
    </v-frame> 
  </screen>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import Screen from '../Screen.vue';
import VFrame from '../VFrame.vue';
import LogoutForm from '../LogoutForm.vue';

export default {
  name: 'User',

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
    Screen,
    VFrame,
    LogoutForm,
  },
};
</script>
