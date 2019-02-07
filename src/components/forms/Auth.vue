<template>
  <form data-test="auth-form" @submit.prevent="emitSubmit">
    <form-field>
      <message data-test="form-message"
        >Log in to your Endpass account to access site actions</message
      >
    </form-field>
    <form-field v-if="error">
      <message :error="true" data-test="error-message">{{ error }}</message>
    </form-field>
    <form-field>
      <div class="auth__fields-as-line">
        <v-input
          v-model="email"
          :invalid="!isEmailValid"
          :autofocus="true"
          name="email"
          type="email"
          placeholder="Enter your email..."
          data-test="email-input"
        />
        <v-button
          :disabled="!termsAccepted || !isEmailValid || loading"
          :submit="true"
          type="primary"
          data-test="submit-button"
          >{{ primaryButtonLabel }}</v-button
        >
      </div>
    </form-field>
    <form-controls>
      <google-auth-button />
      <git-auth-button />
    </form-controls>
    <form-controls>
      <v-checkbox v-model="termsAccepted">
        I accept the
        <a href="https://endpass.com/terms/" target="_blank"
          >Terms of Service</a
        >
        and
        <a href="https://endpass.com/privacy/" target="_blank">Privacy Policy</a
        >.
      </v-checkbox>
    </form-controls>
  </form>
</template>

<script>
import Vue from 'vue';

import VCheckbox from '@endpass/ui/dist/components/VCheckbox';
import VFrame from '../VFrame.vue';
import VInput from '../VInput.vue';
import VButton from '../VButton.vue';
import GoogleAuthButton from '@/components/GoogleAuthButton.vue';
import GitAuthButton from '@/components/GitAuthButton.vue';
import Message from '../Message.vue';
import FormField from '../FormField.vue';
import FormControls from '../FormControls.vue';

Vue.component(VCheckbox);

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
  },

  data: () => ({
    termsAccepted: true,
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
  },
  components: {
    VCheckbox,
    VFrame,
    VButton,
    VInput,
    GoogleAuthButton,
    GitAuthButton,
    Message,
    FormField,
    FormControls,
  },
};
</script>
<style>
.auth__fields-as-line {
  display: flex;
}
</style>
