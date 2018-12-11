<template>  
  <VFrame :loading="!request">
    <form @submit.prevent="emitSubmit">
      <FormField v-if="requesterUrl">
        <a :href="requesterUrl">{{ requesterUrl }}</a> requests sign action.
      </FormField>
      <FormField label="Requires request sign by:">
        <Message :ellipsis="true">
          {{ account }}
        </Message>
      </FormField>
      <FormField v-if="error">
        <message :error="true">{{ error }}</message>
      </FormField>
      <FormField label="Your account password:">
        <VInput 
          v-model="password" 
          :autofocus="true" 
          type="password" 
          placeholder="Enter your password..." />
      </FormField>
      <FormField 
        v-if="request" 
        label="Request data:">
        <VCode>
          {{ JSON.stringify(request.request, null, 2) }}
        </VCode>
      </FormField>
      <FormControls>
        <v-button
          :disabled="loading || !password"
          :submit="true"
          type="primary"
        >{{ primaryButtonLabel }}</v-button>
        <v-button @click="emitCancel">Close</v-button>
      </FormControls>      
    </form>
  </VFrame>
</template>

<script>
import { get } from 'lodash';
import VFrame from '@/components/VFrame.vue';
import VInput from '@/components/VInput.vue';
import VSelect from '@/components/VSelect.vue';
import VCode from '@/components/VCode.vue';
import VButton from '@/components/VButton.vue';
import Message from '@/components/Message.vue';
import FormField from '@/components/FormField.vue';
import FormControls from '@/components/FormControls.vue';

export default {
  name: 'SignForm',

  props: {
    loading: {
      type: Boolean,
      default: false,
    },

    error: {
      type: String,
      default: null,
    },

    request: {
      type: Object,
      default: null,
    },

    accounts: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    password: '',
  }),

  computed: {
    account() {
      return get(this.request, 'address');
    },

    requesterUrl() {
      return get(this.request, 'url');
    },

    primaryButtonLabel() {
      return !this.loading ? 'Sign' : 'Loading...';
    },
  },

  methods: {
    emitSubmit() {
      this.$emit('submit', {
        account: this.account,
        password: this.password,
      });
    },

    emitCancel() {
      this.$emit('cancel');
    },
  },

  components: {
    VFrame,
    VButton,
    VInput,
    VSelect,
    VCode,
    Message,
    FormField,
    FormControls,
  },
};
</script>
