<template>
  <router-view />
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { sendMessageToOpener } from '@@/util/message';
import identityService from '@@/service/identity';

export default {
  name: 'App',

  computed: {
    ...mapState({
      authorized: state => state.accounts.authorized
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
    ...mapActions(['checkAuthStatus']),

//     handleWindowMessage(message) {
//       // Handler messages here, can be me moved to vuex store plugin or middleware
//       if (!message.data) return;
// 
//       const {data} = message;
//       const isMessageFromOpener = data.source === 'endpass-connect-opener';
// 
//       if (isMessageFromOpener) {
//         console.log('message from opener', data)
//       }
//     },

    handleAuthCancel() {
      sendMessageToOpener({
        data: {
          message: 'User cancel auth',
          status: false,
        }
      });
      window.close();
    },

    handleAuthError(err) {
      this.error = err || 'Unhandled error occured';
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

    async handleServiceRequest(res) {
      if (res) {
        this.authorized = true;
        identityService.stopPolling();

        sendMessageToOpener({
          data: {
            status: true,
          }
        });
        window.close();
      }
    },
  },

  async created() {
    // await this.checkAuthStatus()
    
    // window.addEventListener('beforeunload', this.handleWindowClose)
    // window.addEventListener('message', this.handleWindowMessage)

//     try {
//       await identityService.getAccounts();
// 
//       this.authorized = true;
//     } catch (err) {
//       this.authorized = false;
//     } finally {
//       this.inited = true;
//     }
// 
//     if (this.authorized) {
//       sendMessageToOpener({
//         data: {
//           status: true,
//         }
//       });
//     }
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
