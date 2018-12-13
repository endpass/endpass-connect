import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Sign from '@@/app/src/components/screens/Sign.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('Sign', () => {
  describe('render', () => {
    let store;
    let storeData;
    let wrapper;
    let accountsModule;
    let requestsModule;
    let coreModule;

    beforeEach(() => {
      coreModule = {
        state: {
          inited: true,
          loading: false,
        },
        actions: {
          sendReadyMessage: jest.fn(),
        },
      };
      accountsModule = {
        state: {
          accounts: [],
        },
      };
      requestsModule = {
        state: {
          request: {},
        },
        actions: {
          awaitRequestMessage: jest.fn(),
          processRequest: jest.fn(),
          cancelRequest: jest.fn(),
        },
      };
      storeData = {
        modules: {
          accounts: accountsModule,
          core: coreModule,
          requests: requestsModule,
        },
      };
      store = new Vuex.Store(storeData);
      wrapper = shallowMount(Sign, {
        localVue,
        store,
      });
    });

    describe('render', () => {
      it('should correctly render Sign component', () => {
        expect(wrapper.name()).toBe('Sign');
        expect(wrapper.html()).toMatchSnapshot();
      });
    });

    describe('behavior', () => {
      it('should confirm current request with password', () => {
        // TODO Have troubles with triggering event from stub, solve it when possivble
        wrapper.vm.handleSignSubmit({
          password: 'foo',
        });

        expect(requestsModule.actions.processRequest).toBeCalled();
      });

      it('should cancel current request', () => {
        // TODO Have troubles with triggering event from stub, solve it when possivble
        wrapper.vm.handleSignCancel();

        expect(requestsModule.actions.cancelRequest).toBeCalled();
      });
    });
  });
});
