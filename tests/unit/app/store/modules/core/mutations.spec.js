import { state as coreState } from '@@/app/src/store/modules/core';
import coreMutations from '@@/app/src/store/modules/core/mutations';

describe('core mutations', () => {
  let state;

  beforeEach(() => {
    state = { ...coreState };
  });

  describe('changeInitStatus', () => {
    it('should change init status', () => {
      coreMutations.changeInitStatus(state, true);

      expect(state.inited).toBe(true);
    });
  });

  describe('changeLoadingStatus', () => {
    it('should change loading status', () => {
      coreMutations.changeLoadingStatus(state, true);

      expect(state.loading).toBe(true);
    });
  });
});
