<template>
  <label class="form-field">
    <p v-if="label" class="form-field__label">
      {{ label }}
    </p>
    <div class="form-field__content">
      <slot />
    </div>
  </label>
</template>

<script>
export default {
  name: 'FormField',

  props: {
    label: {
      type: String,
      default: null,
    },
  },
};
</script>

<style lang="postcss">
.form-field {
  display: block;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-field__label {
  margin-bottom: 10px;
  font-size: 14px;
}
</style>
