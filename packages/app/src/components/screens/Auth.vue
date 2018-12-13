<template>
  <auth-form
    :inited="inited"
    :loading="loading"
    :show-email="!authorized && !sent"
    :message="formMessage"
    :error="error"
    @cancel="handleAuthCancel"
    @submit="handleAuthSubmit"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex';
import AuthForm from '../AuthForm.vue';

export default {
  name: 'Auth',

  data: () => ({
    error: null,
  }),

  computed: {
    ...mapState({
      inited: state => state.core.inited,
      loading: state => state.core.loading,
      sent: state => state.accounts.linkSent,
      accounts: state => state.accounts.accounts,
    }),

    authorized() {
      return !!this.accounts;
    },

    formMessage() {
      if (this.authorized) {
        return 'You are currently logged in.';
      }

      if (!this.authorized && this.sent) {
        return 'An email with authorization link was sent on your address. Open it in the same browser to sign in.';
      }

      return 'Log in to your Endpass account to access site actions';
    },
  },

  watch: {
    authorized() {
      const { authorized, sent, confirmAuth } = this;

      if (authorized && sent) {
        this.confirmAuth();
      }
    },
  },

  methods: {
    ...mapActions(['auth', 'cancelAuth', 'confirmAuth', 'awaitAuthConfirm']),

    async handleAuthSubmit(email) {
      try {
        const res = await this.auth(email);

        await this.awaitAuthConfirm();
      } catch (err) {
        this.handleAuthError(err);
      }
    },

    handleAuthCancel() {
      this.cancelAuth();
    },

    handleWindowClose(e) {
      this.cancelAuth();
    },

    handleAuthError(error) {
      this.error = error.message || 'Unexpected error, try login later';
    },
  },

  created() {
    window.addEventListener('beforeunload', this.handleWindowClose);
  },

  components: {
    AuthForm,
  },
};
</script>
