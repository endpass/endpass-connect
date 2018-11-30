<template>
  <form class="auth-form" @submit.prevent="emitSubmit">
    <header class="auth-form__header">
      <img class="auth-form__logo" src="../assets/logo.png" alt="Endpass">
      Auth
    </header>
    <div class="auth-form__body">
      <section class="auth-form__message">
        <Message>Log in to your Endpass account to access site actions</Message>
      </section>
      <section class="auth-form__field">
        <VInput
          v-model="email"
          :invalid="email.length > 0 && !isEmailValid"
          :autofocus="true"
          placeholder="Enter your email..."
        ></VInput>
      </section>
      <section class="auth-form__controls">
        <VButton type="primary" :disabled="!isEmailValid" :submit="true">Log in</VButton>
        <VButton>Cancel</VButton>
      </section>
    </div>
  </form>
</template>

<script>
import VInput from '@/components/VInput';
import VButton from '@/components/VButton';
import Message from '@/components/Message';

export default {
  name: 'AuthForm',

  data: () => ({
    email: '',
  }),

  computed: {
    isEmailValid() {
      return (
        this.email && /[a-zA-Z._\-0-9]+@[a-z0-9]+\.[a-z]{2,}/g.test(this.email)
      );
    },
  },

  methods: {
    emitSubmit() {
      this.$emit('submit');
    },
  },

  components: {
    VButton,
    VInput,
    Message,
  },
};
</script>

<style lang="postcss">
.auth-form {
  overflow: hidden;
  max-width: 360px;
  margin: 50px auto;
  border-radius: 4px;
  box-shadow: 0 5px 10px 1px rgba(0, 0, 0, 0.15);
  background-color: #fff;
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
  padding: 15px;
  font-size: 1em;
}

.auth-form__field {
  margin-bottom: 15px;
}

.auth-form__message {
  margin-bottom: 30px;
}

.auth-form__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;

  & > button {
    flex: 0 0 auto;
  }
}
</style>
