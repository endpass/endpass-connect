<template>
  <section class="form-controls">
    <slot />
  </section>
</template>

<style lang="postcss">
.form-controls {
  display: flex;
  align-items: center;
  margin-top: 30px;

  & > button {
    flex: 0 0 auto;

    &:last-child {
      margin-left: auto;
    }
  }
}
</style>
