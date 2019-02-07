<template>
  <div class="frame">
    <header class="frame__header">
      <img class="frame__logo" src="../assets/logo.png" alt="Endpass" />
      Connect
      <span class="frame__close-btn">
        <v-button v-if="closable" data-test="close-button" @click="emitClose">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 8 8"
          >
            <path
              d="M1.41 0l-1.41 1.41.72.72 1.78 1.81-1.78 1.78-.72.69 1.41 1.44.72-.72 1.81-1.81 1.78 1.81.69.72 1.44-1.44-.72-.69-1.81-1.78 1.81-1.81.72-.72-1.44-1.41-.69.72-1.78 1.78-1.81-1.78-.72-.72z"
            />
          </svg>
        </v-button>
      </span>
    </header>
    <div class="frame__body">
      <loading-screen v-if="loading" />
      <slot v-else />
    </div>
  </div>
</template>

<script>
import LoadingScreen from './LoadingScreen.vue';
import VButton from './VButton.vue';
import VIcon from './VIcon';

export default {
  name: 'VFrame',

  props: {
    closable: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    emitClose() {
      this.$emit('close');
    },
  },

  components: {
    LoadingScreen,
    VButton,
    VIcon,
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

.frame__close-btn {
  margin-left: auto;
  path {
    fill: #fff;
  }
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

@media (max-width: 768px) {
  .frame {
    max-width: initial;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    animation: none;
  }
}
</style>
