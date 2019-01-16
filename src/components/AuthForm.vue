<template>
  <form 
    data-test="auth-form" 
    @submit.prevent="emitSubmit"
  >
    <form-field>
      <message data-test="form-message">Log in to your Endpass account to access site actions</message>
    </form-field>
    <form-field v-if="error">
      <message 
        :error="true" 
        data-test="error-message"
      >{{ error }}</message>
    </form-field>
    <form-field>
      <v-input
        v-model="email"
        :invalid="!isEmailValid"
        :autofocus="true"
        name="email"
        placeholder="Enter your email..."
        data-test="email-input"
      />
    </form-field>
    <form-controls>
      <v-button
        :disabled="!isEmailValid || loading"
        :submit="true"
        type="primary"
        data-test="submit-button"
      >{{ primaryButtonLabel }}</v-button>
      <v-button 
        :disabled="!closable"
        data-test="cancel-button" 
        @click="emitCancel"
      >Close</v-button>
    </form-controls>
  </form>
</template>

<script>
import VFrame from './VFrame.vue';
import VInput from './VInput.vue';
import VButton from './VButton.vue';
import Message from './Message.vue';
import FormField from './FormField.vue';
import FormControls from './FormControls.vue';

export default {
  name: 'AuthForm',

  props: {
    inited: {
      type: Boolean,
      default: false,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    error: {
      type: String,
      default: null,
    },

    closable: {
      type: Boolean,
      default: true,
    },
  },

  data: () => ({
    email: '',
  }),

  computed: {
    primaryButtonLabel() {
      return !this.loading ? 'Log in' : 'Loading...';
    },

    isEmailValid() {
      return /[a-zA-Z._\-0-9]+@[a-z0-9]+\.[a-z]{2,}/g.test(this.email);
    },
  },

  methods: {
    emitSubmit() {
      if (this.isEmailValid) {
        this.$emit('submit', this.email);
      }
    },

    emitCancel() {
      this.$emit('cancel');
    },
  },

  components: {
    VFrame,
    VButton,
    VInput,
    Message,
    FormField,
    FormControls,
  },
};
</script>
