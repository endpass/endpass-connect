<template>
  <p
    :class="{
      message: true,
      error: error,
      success: success,
      ellipsis: ellipsis,
    }"
  >
    <slot />
  </p>
</template>

<script>
export default {
  name: 'Message',

  props: {
    ellipsis: {
      type: Boolean,
      default: false,
    },

    error: {
      type: Boolean,
      default: false,
    },

    success: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="postcss">
.message {
  font-size: 1em;
  line-height: 1.5;

  &.error {
    color: #f00;
  }

  &.success {
    color: #4dce4d;
  }

  &.ellipsis {
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
