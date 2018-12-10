<template>
  <VFrame :loading="!inited"> 
    <form class="auth-form" @submit.prevent="emitSubmit">
      <section class="auth-form__message">
        <message>{{ message }}</message>
      </section>
      <section v-if="error" class="auth-form__message">
        <message :error="true">{{ error }}</message>
      </section>
      <section v-if="showEmail" class="auth-form__field">
        <v-input
          v-model="email"
          :invalid="email.length > 0 && !isEmailValid"
          :autofocus="true"
          name="email"
          placeholder="Enter your email..."
        />
      </section>
      <section class="auth-form__controls">
        <v-button
          v-if="showEmail"
          :disabled="!isEmailValid || loading"
          :submit="true"
          type="primary"
        >{{ primaryButtonLabel }}</v-button>
        <v-button @click="emitCancel">Close</v-button>
      </section>
    </form>
  </VFrame>  
</template>

<script>
import VFrame from '@/components/VFrame.vue'
import VInput from '@/components/VInput.vue';
import VButton from '@/components/VButton.vue';
import Message from '@/components/Message.vue';

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
  },
};
</script>

<style lang="postcss">
.auth-form__field {
  margin-bottom: 15px;
}

.auth-form__message {
  margin-bottom: 20px;
}

.auth-form__controls {
  display: flex;
  align-items: center;
  margin-top: 30px;

  & > button {
    flex: 0 0 auto;

    &:last-child {
      margin-left: auto;
    }
  }
}
</style>
