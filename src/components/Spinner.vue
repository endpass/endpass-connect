<template>
  <div class="spinner" />
</template>

<script>
export default {
  name: 'Spinner',
};
</script>

<style lang="postcss">
@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid #6d1f966e;
  border-top: 3px solid #6d1f96;
  animation: rotate 750ms linear infinite;
}
</style>
