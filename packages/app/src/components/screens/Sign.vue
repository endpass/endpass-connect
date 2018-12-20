<template>
  <sign-form 
    :accounts="accounts"
    :loading="loading"
    :request="request"
    :error="error"
    @cancel="handleSignCancel"
    @submit="handleSignSubmit"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex';
import SignForm from '../SignForm.vue';

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
  },

  methods: {
    ...mapActions([
      'awaitRequestMessage',
      'processRequest',
      'cancelRequest',
      'sendReadyMessage',
    ]),

    async handleSignSubmit(res) {
      try {
        await this.processRequest(res.password);
        this.error = null;
      } catch (err) {
        console.error(err);
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
    window.addEventListener('beforeunload', this.handleWindowClose);

    await this.sendReadyMessage();

    this.awaitRequestMessage();
  },

  components: {
    SignForm,
  },
};
</script>
