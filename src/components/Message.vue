<template>
  <p class="message">
    <slot></slot>
  </p>
</template>

<script>
export default {
  name: 'Message',
};
</script>

<style lang="postcss">
.message {
  font-size: 1em;
}
</style>
