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
  import { mapActions, mapState, mapGetters } from 'vuex'
  import AuthForm from '@/components/AuthForm.vue';

  export default {
    name: 'AuthScreen',

    data: () => ({
      error: null,
    }),

    watch: {
      authorized() {
        const { authorized, sent, sendMessageAndClose } = this

        if (authorized && sent) {
          sendMessageAndClose({
            status: true
          })
        }
      }
    },

    computed: {
      ...mapGetters({
        authorized: 'isAuthorized'
      }),    

      ...mapState({
        inited: state => state.core.inited,
        loading: state => state.core.loading,
        sent: state => state.accounts.linkSent,
      }),

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
      ...mapActions(['auth', 'awaitAuthConfirm', 'sendMessage', 'closeDialog']),

      sendMessageAndClose(message) {
        this.sendMessage(message)
        this.closeDialog()
      },
      
      async handleAuthSubmit(email) {
        try {
          const res = await this.auth(email);

          await this.awaitAuthConfirm()
        } catch (err) {
          this.handleAuthError(err);
        }
      },

      handleAuthCancel() {
        this.sendMessageAndClose({
          message: 'User cancel auth',
          status: false,  
        })
      },

      // Return it to handle window closing by user
      // handleWindowClose() {
      //   sendMessageToOpener({
      //     data: {
      //       message: 'User close auth dialog',
      //       status: false,
      //     }
      //   });
      // },

      handleAuthError(error) {
        this.error = error || 'Unexpected error, try login later'
      }
    },

    components: {
      AuthForm
    }
  }
</script>