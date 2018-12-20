<template>
  <create-account-form
    v-if="authorized && isAccountsEmpty"
    @request="handleAccountRequest"
    @cancel="handleAuthCancel"
  />
  <auth-form
    v-else
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
import isEmpty from 'lodash/isEmpty';
import { mapActions, mapState } from 'vuex';
import AuthForm from '../AuthForm.vue';
import CreateAccountForm from '../CreateAccountForm.vue';

export default {
  name: 'Auth',

  data: () => ({
    error: null,
    needAccount: false,
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

    confirmed() {
      return this.authorized && this.sent;
    },

    isAccountsEmpty() {
      return isEmpty(this.accounts);
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
    authorized: {
      handler() {
        this.handleAuthorizationDataChange();
      },
      immediate: true,
    },

    accounts: {
      handler() {
        this.handleAuthorizationDataChange();
      },
      immediate: true,
    },
  },

  methods: {
    ...mapActions([
      'auth',
      'cancelAuth',
      'confirmAuth',
      'awaitAuthConfirm',
      'awaitAccountCreate',
      'sendReadyMessage',
      'openCreateAccountPage',
    ]),

    async handleAuthSubmit(email) {
      try {
        await this.auth(email);
        await this.awaitAuthConfirm();
      } catch (err) {
        console.error(err);
        this.handleAuthError(err);
      }
    },

    handleAuthorizationDataChange() {
      const {
        authorized,
        awaitAccountCreate,
        isAccountsEmpty,
        confirmAuth,
      } = this;

      if (authorized && isAccountsEmpty) {
        awaitAccountCreate();
      } else if (authorized && !isAccountsEmpty) {
        confirmAuth();
      }
    },

    async handleAccountRequest() {
      this.openCreateAccountPage();
    },

    handleAuthCancel() {
      this.cancelAuth();
    },

    handleWindowClose() {
      this.cancelAuth();
    },

    handleAuthError(error) {
      this.error = error.message || 'Unexpected error, try login later';
    },
  },

  async created() {
    window.addEventListener('beforeunload', this.handleWindowClose);

    await this.sendReadyMessage();
  },

  components: {
    AuthForm,
    CreateAccountForm,
  },
};
</script>
