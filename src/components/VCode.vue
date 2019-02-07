<template>
  <pre class="code">
    <slot />
  </pre>
</template>

<script>
export default {
  name: 'VCode',
};
</script>

<style lang="postcss">
.code {
  padding: 20px;
  background-color: #dadada;
  overflow: auto;
  whitespace: nowrap;
}
</style>
