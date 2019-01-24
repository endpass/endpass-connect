const resolveMessage = async ({ commit }, result) => {
  commit('changeLoadingStatus', true);
  commit('setMessageResolution', result);
  commit('setMessageAwaitingStatus', null);
};

const awaitMessageResolution = ({ state }) =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const interval = setInterval(() => {
      if (state.resolution) {
        clearInterval(interval);
        return resolve(state.resolution);
      }
    }, 1500);
  });

export default {
  resolveMessage,
  awaitMessageResolution,
};
