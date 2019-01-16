<template>
  <div />
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Bridge',

  methods: {
    ...mapActions(['subscribeOnBridge']),
  },

  created() {
    this.subscribeOnBridge();
  },
};
</script>
