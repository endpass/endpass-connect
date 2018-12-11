<template>
  <VFrame :loading="!inited"> 
    <form @submit.prevent="emitSubmit">
      <FormField>
        <message>{{ message }}</message>
      </FormField>
      <FormField v-if="error">
        <message :error="true">{{ error }}</message>
      </FormField>
      <FormField v-if="showEmail">
        <v-input
          v-model="email"
          :invalid="email.length > 0 && !isEmailValid"
          :autofocus="true"
          name="email"
          placeholder="Enter your email..."
        />
      </FormField>
      <FormControls>
        <v-button
          v-if="showEmail"
          :disabled="!isEmailValid || loading"
          :submit="true"
          type="primary"
        >{{ primaryButtonLabel }}</v-button>
        <v-button @click="emitCancel">Close</v-button>
      </FormControls>
    </form>
  </VFrame>  
</template>

<script>
import VFrame from '@/components/VFrame.vue'
import VInput from '@/components/VInput.vue';
import VButton from '@/components/VButton.vue';
import Message from '@/components/Message.vue';
import FormField from '@/components/FormField.vue'
import FormControls from '@/components/FormControls.vue'

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
      this.$emit('submit', this.email);
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
