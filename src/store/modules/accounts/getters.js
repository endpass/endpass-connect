export default {
  availableAccounts: state =>
    state.accounts.filter(account => account.type !== 'PublicAccount'),
};
