<template>
  <SignForm 
    :accounts="accounts"
    :loading="loading"
    :request="request"
    @cancel="handleSignCancel"
    @submit="handleSignSubmit"
  />
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import SignForm from '@/components/SignForm.vue';

export default {
  name: 'SignScreen',

  computed: {
    ...mapState({
      accounts: state => state.accounts.accounts,
      inited: state => state.core.inited,
      loading: state => state.core.loading,
      request: state => state.requests.request
    }),
  },

  methods: {
    ...mapActions(['awaitRequestMessage', 'sendMessage', 'closeDialog', 'processRequest']),

    sendMessageAndClose(message) {
      this.sendMessage(message)
      this.closeDialog()
    },

    async handleSignSubmit(res) {
      await this.processRequest(res)
    },

    handleSignCancel() {
      this.sendMessageAndClose({
        message: 'User cancel sign',
        status: false,  
      })
    }
  },

  async created() {
    try {
      this.awaitRequestMessage()
    } catch (err) {
      console.log(err)
    }
  },

  components: {
    SignForm
  }
}
</script>