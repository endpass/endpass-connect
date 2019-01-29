<template>
  <screen>
    <v-frame :loading="!request">
      <sign-form
        :accounts="accounts"
        :loading="loading"
        :request="request"
        :error="error"
        :closable="isDialog"
        @cancel="handleSignCancel"
        @submit="handleSignSubmit"
      />
    </v-frame>
  </screen>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import Screen from '../Screen.vue';
import VFrame from '../VFrame.vue';
import SignForm from '../forms/Sign.vue';

export default {
  name: 'Sign',

  data: () => ({
    error: null,
  }),

  computed: {
    ...mapState({
      accounts: state => state.accounts.accounts,
      inited: state => state.core.inited,
      loading: state => state.core.loading,
      request: state => state.requests.request,
    }),
    ...mapGetters(['isDialog']),
  },

  methods: {
    ...mapActions(['awaitRequestMessage', 'processRequest', 'cancelRequest']),

    async handleSignSubmit(res) {
      try {
        await this.processRequest(res.password);
        this.error = null;
      } catch (err) {
        this.error = err.message;
      }
    },

    handleSignCancel() {
      this.cancelRequest();
    },

    handleWindowClose() {
      this.cancelRequest();
    },
  },

  async created() {
    if (this.isDialog) {
      window.addEventListener('beforeunload', this.handleWindowClose);
    }
  },

  components: {
    Screen,
    SignForm,
    VFrame,
  },
};
</script>
