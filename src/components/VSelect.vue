<template>
  <select :value="value" :name="name" class="select" @change="emitInput">
    <option v-for="item in items" :key="item.value" :value="item.value">{{
      item.label
    }}</option>
  </select>
</template>

<script>
export default {
  name: 'VInput',

  props: {
    items: {
      type: Array,
      default: () => [],
    },

    name: {
      type: String,
      default: '',
    },

    value: {
      type: [String, Number],
      default: '',
    },
  },

  methods: {
    emitInput(e) {
      this.$emit('input', e.target.value);
    },

    emitKeypress(e) {
      this.$emit('keypress', e);
    },
  },
};
</script>

<style lang="postcss">
.select {
  -webkit-appearance: none;
  width: 100%;
  border: none;
  outline: none;
  border-radius: 0;
  padding: 10px 0;
  border-bottom: 1px solid #4d4d4d;
  border-radius: 0;
  font-size: 16px;
  line-height: 1.5;
  transition: 0.25s;
  background: transparent;
  cursor: pointer;
}
</style>
