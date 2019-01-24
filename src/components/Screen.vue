<template>
  <div>
    <slot />
  </div> 
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Screen',

  methods: {
    ...mapActions(['subscribeOnDialog']),
  },

  created() {
    this.subscribeOnDialog();
  },
};
</script>
