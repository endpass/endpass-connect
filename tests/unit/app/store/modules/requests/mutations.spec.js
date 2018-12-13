import { state as requestsState } from '@@/app/src/store/modules/requests';
import requestsMutations from '@@/app/src/store/modules/requests/mutations';

describe('requests mutations', () => {
  let state;

  beforeEach(() => {
    state = { ...requestsState };
  });

  describe('setRequest', () => {
    it('should set current request', () => {
      const request = {
        foo: 'bar',
      };

      requestsMutations.setRequest(state, request);

      expect(state.request).toEqual(request);
    });
  });
});
