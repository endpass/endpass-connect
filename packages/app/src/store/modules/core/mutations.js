const changeInitStatus = (state, status) => {
  state.inited = status;
};

const changeLoadingStatus = (state, status) => {
  state.loading = status;
};

export default {
  changeInitStatus,
  changeLoadingStatus,
};
