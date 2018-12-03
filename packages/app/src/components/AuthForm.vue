<template>
  <form class="auth-form" @submit.prevent="emitSubmit">
    <header class="auth-form__header">
      <img class="auth-form__logo" src="../assets/logo.png" alt="Endpass">
      Connect
    </header>
    <div class="auth-form__body">
      <LoadingScreen v-if="!inited"/>
      <template v-else>
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
      </template>
    </div>
  </form>
</template>

<script>
import VInput from './VInput.vue';
import VButton from './VButton.vue';
import Message from './Message.vue';
import LoadingScreen from './LoadingScreen.vue';

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
    VButton,
    VInput,
    Message,
    LoadingScreen,
  },
};
</script>

<style lang="postcss">
@keyframes slideIn {
  from {
    transform: translateY(15px);
    opacity: 0;
  }
}

.auth-form {
  overflow: hidden;
  max-width: 360px;
  margin: 50px auto;
  border-radius: 4px;
  box-shadow: 0 5px 10px 1px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  animation: slideIn 0.75s;
}

.auth-form__header {
  display: flex;
  align-items: center;
  padding: 15px;
  font-size: 1.5em;
  background-color: #4b0472;
  color: #fff;
}

.auth-form__logo {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  margin-right: 12.5px;
}

.auth-form__body {
  position: relative;
  padding: 30px 15px 15px;
  min-height: 100px;
  font-size: 1em;
}

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
