<template>
  <section class="form-controls">
    <slot />
  </section>
</template>

<style lang="postcss">
.form-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;

  .button + .button {
    margin-left: 10px;
  }
}
</style>
