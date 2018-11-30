<template>
  <AuthForm/>
</template>

<script>
import AuthForm from '@/components/AuthForm';

export default {
  name: 'App',

  components: {
    AuthForm,
  },
};
</script>

<style lang="postcss">
@import '../node_modules/reset.css/reset.css';
</style>

<style lang="postcss">
* {
  box-sizing: border-box;
}

body {
  background-color: #6d1f96;
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

