<template>
  <div>
    <form-field>
      <message data-test="form-message">{{ message }}</message>
    </form-field>
    <form-controls>
      <v-button
        :disabled="!closable"
        data-test="cancel-button"
        @click="emitCancel"
        >Close</v-button
      >
    </form-controls>
  </div>
</template>

<script>
import VButton from '../VButton.vue';
import Message from '../Message.vue';
import FormField from '../FormField.vue';
import FormControls from '../FormControls.vue';

export default {
  name: 'MessageForm',

  props: {
    message: {
      type: String,
      required: true,
    },

    closable: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    emitCancel() {
      this.$emit('cancel');
    },
  },

  components: {
    VButton,
    Message,
    FormField,
    FormControls,
  },
};
</script>
