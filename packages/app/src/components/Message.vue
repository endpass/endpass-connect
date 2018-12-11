<template>
  <p :class="{ message: true, error: error, ellipsis: ellipsis }">
    <slot/>
  </p>
</template>

<script>
export default {
  name: 'Message',

  props: {
    ellipsis: {
      type: Boolean,
      default: false
    },

    error: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="postcss">
.message {
  font-size: 1em;

  &.error {
    color: #f00;
  }

  &.ellipsis {
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
