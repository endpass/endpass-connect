<template>
  <AuthForm
    :loading="loading"
    :show-email="!authorized && !sent"
    :message="formMessage"
    :error="error"
    @cancel="handleAuthCancel"
    @submit="handleAuthSubmit"
  />
</template>

<script>
import identityService from '@/service/identity';

import AuthForm from '@/components/AuthForm';

export default {
  name: 'App',

  data: () => ({
    loading: false,
    sent: false,
    authorized: false,
    error: null,
  }),

  computed: {
    formMessage() {
      if (this.authorized) {
        return 'You are currently logged in.';
      }

      if (!this.authorized && this.sent) {
        return 'An email with authorization link was sent on your address. Check it and return to application.';
      }

      return 'Log in to your Endpass account to access site actions';
    },
  },

  methods: {
    handleAuthCancel() {
      console.log('cancel');
    },

    handleAuthError(err) {
      this.error = err || 'Unhandled error occured';
    },

    async handleAuthSubmit(email) {
      this.loading = true;

      try {
        const res = await identityService.auth(email);

        if (res) {
          identityService.startPolling(this.handleServiceRequest);

          this.error = null;
          this.sent = true;
        } else {
          this.handleAuthError();
        }
      } catch (err) {
        this.handleAuthError(err.message);
      } finally {
        this.loading = false;
      }
    },

    async handleServiceRequest(res) {
      if (res) {
        identityService.stopPolling();
      }
    },
  },

  async created() {
    try {
      await identityService.getAccounts();

      this.authorized = true;
    } catch (err) {
      this.authorized = false;
    }

    if (this.authorized) {
      console.log('switch to parent here', window.parent);
    }
  },

  components: {
    AuthForm,
  },
};
</script>

<style lang="postcss">
@import '../node_modules/reset.css/reset.css';
</style>

<style lang="postcss">
* {
  box-sizing: border-box;
}

body {
  background-color: #6d1f96;
}

html,
input,
button,
select {
  font-family: BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Helvetica,
    Arial, sans-serif;
}
</style>
