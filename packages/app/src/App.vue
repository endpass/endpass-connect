<template>
  <AuthForm
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
import AuthForm from './components/AuthForm.vue';
import { sendMessage } from './util/message';
import identityService from '../../service/identity';

export default {
  name: 'App',

  data: () => ({
    inited: false,
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
        return 'An email with authorization link was sent on your address. Open it in the same browser to sign in.';
      }

      return 'Log in to your Endpass account to access site actions';
    },
  },

  methods: {
    switchToParentWindowWithClose() {
      window.close();
    },

    handleAuthCancel() {
      sendMessage({
        status: false,
      });
      window.close();
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
        this.authorized = true;
        identityService.stopPolling();

        sendMessage({
          status: true,
        });
        window.close();
      }
    },
  },

  async created() {
    try {
      await identityService.getAccounts();

      this.authorized = true;
    } catch (err) {
      this.authorized = false;
    } finally {
      this.inited = true;
    }

    if (this.authorized) {
      sendMessage({
        status: true,
      });
    }
  },

  components: {
    AuthForm,
  },
};
</script>

<style lang="postcss">
@import '../../../node_modules/reset.css/reset.css';
</style>

<style lang="postcss">
* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
}

body {
  background: linear-gradient(to bottom, #6d2198 0%, #4b0873 100%);
  background-repeat: no-repeat;
  background-attachment: fixed;
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
