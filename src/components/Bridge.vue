<template>
  <v-frame>
    <p>Endpass Connect bridge {{ version }}</p>
  </v-frame>
</template>

<script>
import { mapActions } from 'vuex';
import pkg from '../../package.json';
import VFrame from './VFrame.vue';

export default {
  name: 'Bridge',

  computed: {
    version() {
      return `v${pkg.version}`;
    },
  },

  methods: {
    ...mapActions(['subscribeOnBridge']),
  },

  created() {
    this.subscribeOnBridge();
  },

  components: {
    VFrame,
  },
};
</script>
