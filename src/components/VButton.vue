<template>
  <a
    v-if="href"
    :href="href"
    :class="{ button: true, [type]: type, disabled: disabled }"
  >
    <slot />  
  </a>
  <button
    v-else
    :class="{ button: true, [type]: type, disabled: disabled }"
    :disabled="disabled"
    :type="buttonType"
    @click="emitClick"
  >
    <slot/>
  </button>
</template>

<script>
export default {
  name: 'VButton',

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      default: null,
    },

    submit: {
      type: Boolean,
      default: false,
    },

    href: {
      type: String,
      default: null,
    },
  },

  computed: {
    buttonType() {
      return this.submit ? 'submit' : 'button';
    },
  },

  methods: {
    emitClick() {
      this.$emit('click');
    },
  },
};
</script>

<style lang="postcss">
.button {
  height: 45px;
  padding: 6.5px 15px;
  border: none;
  background: transparent;
  line-height: 1.5;
  font-size: 20px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;

  &.primary {
    background: #4b0472;
    color: #fff;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
