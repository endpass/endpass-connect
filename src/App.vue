<template>
  <router-view />
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'App',

  computed: {
    ...mapGetters(['isDialog']),
  },

  methods: {
    ...mapActions(['init']),
  },

  async created() {
    await this.init();
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

html {
  min-height: 100%;
}

body {
  background: linear-gradient(to bottom, #6d2198 0%, #4b0873 100%);
  background-repeat: no-repeat;
  background-attachment: fixed;
}

body,
input,
button,
select {
  font-family: BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Helvetica,
    Arial, sans-serif;
}

@media (max-width: 768px) {
  body {
    background: #fff;
  }
}
</style>
