<template>
  <screen>
    <v-frame :loading="!inited">
      <account-form
        :loading="loading"
        :closable="isDialog"
        :accounts="accountsOptions"
        :networks="networksOptions"
        :form-data="formData"
        :error="error"
        :message="message"
        @submit="handleAccountFormSubmit"
        @cancel="handleCancel"
        @logout="handleLogout"
      />
    </v-frame>
  </screen>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import { DEFAULT_NETWORKS } from '@/constants';
import Screen from '../Screen.vue';
import VFrame from '../VFrame.vue';
import AccountForm from '../forms/Account.vue';

export default {
  name: 'User',

  data: () => ({
    formData: {
      activeAccount: null,
      activeNet: null,
    },
    error: null,
    message: null,
  }),

  computed: {
    ...mapState({
      inited: state => state.core.inited,
      loading: state => state.core.loading,
      settings: state => state.accounts.settings,
    }),
    ...mapGetters(['availableAccounts', 'isDialog']),

    networksOptions() {
      return Object.values(DEFAULT_NETWORKS).map(({ id, name }) => ({
        value: id,
        label: name,
      }));
    },

    accountsOptions() {
      return this.availableAccounts.map(({ address }) => ({
        value: address,
        label: address,
      }));
    },
  },

  watch: {
    formData: {
      handler() {
        if (this.message) {
          this.message = null;
        }

        if (this.error) {
          this.error = null;
        }
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions(['logout', 'closeAccount', 'getAccounts', 'updateSettings']),

    async handleAccountFormSubmit() {
      const { activeAccount, activeNet } = this.formData;

      try {
        this.error = null;

        await this.updateSettings({
          lastActiveAccount: activeAccount,
          net: activeNet,
        });
      } catch (err) {
        console.error(err);

        this.error = err.message;
      }
    },

    async handleLogout() {
      this.logout();
    },

    handleCancel() {
      this.closeAccount();
    },

    handleWindowClose() {
      this.closeAccount();
    },
  },

  async created() {
    const { settings } = this;

    this.formData.activeAccount = settings.lastActiveAccount;
    this.formData.activeNet = settings.net;

    if (this.isDialog) {
      window.addEventListener('beforeunload', this.handleWindowClose);
    }
  },

  components: {
    Screen,
    VFrame,
    AccountForm,
  },
};
</script>
