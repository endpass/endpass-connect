<template>
  <div class="frame">
    <header class="frame__header">
      <img 
        class="frame__logo" 
        src="../assets/logo.png" 
        alt="Endpass">
      Connect
    </header>
    <div class="frame__body">
      <LoadingScreen v-if="loading"/>
      <slot v-else />
    </div>
  </div>
</template>

<script>
import LoadingScreen from '@/components/LoadingScreen.vue';

export default {
  name: 'VFrame',

  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },

  components: {
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

.frame {
  overflow: hidden;
  max-width: 360px;
  margin: 50px auto;
  border-radius: 4px;
  box-shadow: 0 5px 10px 1px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  animation: slideIn 0.75s;
}

.frame__header {
  display: flex;
  align-items: center;
  padding: 15px;
  font-size: 1.5em;
  background-color: #4b0472;
  color: #fff;
}

.frame__logo {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  margin-right: 12.5px;
}

.frame__body {
  position: relative;
  padding: 30px 15px 15px;
  min-height: 100px;
  font-size: 1em;
}
</style>
