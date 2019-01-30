<template>
  <form @submit.prevent="emitSubmit">
    <form-field v-if="message">
      <message :success="true" data-test="success-message">{{
        message
      }}</message>
    </form-field>
    <form-field v-if="error">
      <message :error="true" data-test="error-message">{{ error }}</message>
    </form-field>
    <form-field label="Active account address">
      <v-select
        v-model="formData.activeAccount"
        :items="accounts"
        name="activeAccount"
      />
    </form-field>
    <form-field label="Active network">
      <v-select
        v-model="formData.activeNet"
        :items="networks"
        name="activeNetwork"
      />
    </form-field>
    <form-field>
      <v-button
        :submit="true"
        :disabled="loading"
        type="primary"
        data-test="submit-button"
        fluid
        >{{ primaryButtonLabel }}</v-button
      >
    </form-field>
    <v-faucet-button
      v-if="isRopsten"
      :address="formData.activeAccount"
      class-name="button primary fluid"
      @before-request="emitDonateRequest"
      @donate="emitDonateSuccess"
      @donate-error="emitDonateError"
    >
      Request 1 ETH from faucet
    </v-faucet-button>
    <form-controls>
      <v-button
        :disabled="loading"
        type="danger"
        data-test="logout-button"
        @click="emitLogout"
        >Logout</v-button
      >
      <v-button
        :disabled="!closable || loading"
        data-test="cancel-button"
        @click="emitCancel"
        >Close</v-button
      >
    </form-controls>
  </form>
</template>

<script>
import { VFaucetButton } from '@endpass/faucet';
import { DEFAULT_NETWORKS } from '@/constants';
import VButton from '../VButton.vue';
import VSelect from '../VSelect.vue';
import Message from '../Message.vue';
import FormField from '../FormField.vue';
import FormControls from '../FormControls.vue';

export default {
  name: 'AccountForm',

  props: {
    closable: {
      type: Boolean,
      default: true,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    error: {
      type: String,
      default: null,
    },

    message: {
      type: String,
      default: null,
    },

    accounts: {
      type: Array,
      default: () => [],
    },

    networks: {
      type: Array,
      default: () => [],
    },

    formData: {
      type: Object,
      required: true,
    },
  },

  computed: {
    primaryButtonLabel() {
      return !this.loading ? 'Update account' : 'Loading...';
    },

    isRopsten() {
      const ropstenNet = Object.values(DEFAULT_NETWORKS).find(
        net => net.networkType === 'ropsten',
      );

      /* eslint-disable-next-line */
      return this.formData.activeNet == ropstenNet.id;
    },
  },

  methods: {
    emitSubmit() {
      if (!this.loading) {
        this.$emit('submit');
      }
    },

    emitLogout() {
      if (!this.loading) {
        this.$emit('logout');
      }
    },

    emitCancel() {
      if (this.closable) {
        this.$emit('cancel');
      }
    },

    emitDonateRequest() {
      this.$emit('donate-request');
    },

    emitDonateSuccess(e) {
      this.$emit('donate-success', e);
    },

    emitDonateError(e) {
      if (e.message.includes('403')) {
        this.$emit(
          'donate-error',
          'Something went wrong. Try request dontaion later!',
        );
      }
    },
  },

  components: {
    VFaucetButton,
    VButton,
    VSelect,
    Message,
    FormField,
    FormControls,
  },
};
</script>
