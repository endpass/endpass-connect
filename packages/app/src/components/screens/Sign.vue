<template>
  <SignForm 
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
import SignForm from '@/components/SignForm.vue';

export default {
  name: 'SignScreen',

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
      'sendReadyMessage',
      'processRequest',
      'cancelRequest',
    ]),

    async handleSignSubmit(res) {
      try {
        await this.processRequest(res.password);
        this.error = null;
      } catch (err) {
        this.error = err;
      }
    },

    handleSignCancel() {
      this.cancelRequest();
    },

    handleWindowClose(e) {
      this.cancelRequest();
    },
  },

  async created() {
    window.addEventListener('beforeunload', this.handleWindowClose)
    
    await this.sendReadyMessage();
    this.awaitRequestMessage();
  },

  components: {
    SignForm,
  },
};
</script>
