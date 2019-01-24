const setMessageAwaitingStatus = (state, status) => {
  state.awaits = status;
};

const setMessageResolution = (state, payload) => {
  state.resolution = payload;
};

export default {
  setMessageAwaitingStatus,
  setMessageResolution,
};
