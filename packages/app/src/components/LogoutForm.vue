<template>
  <form @submit.prevent="emitSubmit"> 
    <form-field>
      <message data-test="form-message">You are currently logged in. Press "Log out" button to terminate your current session.</message>
    </form-field>
    <form-controls>
      <v-button 
        :submit="true"
        :disabled="loading"
        type="primary"
        data-test="submit-button" 
      >Log out</v-button>
      <v-button 
        :disabled="!closable"
        data-test="cancel-button" 
        @click="emitCancel"
      >Close</v-button>
    </form-controls>
  </form>  
</template>

<script>
import VButton from './VButton.vue';
import Message from './Message.vue';
import FormField from './FormField.vue';
import FormControls from './FormControls.vue';

export default {
  name: 'LogoutForm',

  props: {
    closable: {
      type: Boolean,
      default: true,
    },

    loading: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    emitSubmit() {
      this.$emit('submit');
    },

    emitCancel() {
      if (this.closable) {
        this.$emit('cancel');
      }
    },
  },

  components: {
    VButton,
    Message,
    FormField,
    FormControls,
  },
};
</script>
