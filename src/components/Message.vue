<template>
  <p :class="{ message: true, error: error }">
    <slot/>
  </p>
</template>

<script>
export default {
  name: 'Message',

  props: {
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
}
</style>
