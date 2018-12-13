<template>
  <v-frame :loading="!inited"> 
    <form data-test="auth-form" @submit.prevent="emitSubmit">
      <form-field>
        <message data-test="form-message">{{ message }}</message>
      </form-field>
      <form-field v-if="error">
        <message :error="true" data-test="error-message">{{ error }}</message>
      </form-field>
      <form-field v-if="showEmail">
        <v-input
          v-model="email"
          :invalid="email.length > 0 && !isEmailValid"
          :autofocus="true"
          name="email"
          placeholder="Enter your email..."
          data-test="email-input"
        />
      </form-field>
      <form-controls>
        <v-button
          v-if="showEmail"
          :disabled="!isEmailValid || loading"
          :submit="true"
          type="primary"
          data-test="submit-button"
        >{{ primaryButtonLabel }}</v-button>
        <v-button @click="emitCancel" data-test="cancel-button">Close</v-button>
      </form-controls>
    </form>
  </v-frame>  
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

    showEmail: {
      type: Boolean,
      default: true,
    },

    message: {
      type: String,
      required: true,
    },

    error: {
      type: String,
      default: null,
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
      return (
        this.email && /[a-zA-Z._\-0-9]+@[a-z0-9]+\.[a-z]{2,}/g.test(this.email)
      );
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
