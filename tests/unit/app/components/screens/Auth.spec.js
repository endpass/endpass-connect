import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Auth from '@@/app/src/components/screens/Auth.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('Auth', () => {
  let store;
  let storeData;
  let wrapper;
  let accountsModule;
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
        linkSent: false,
        accounts: null,
      },
      actions: {
        auth: jest.fn(),
        cancelAuth: jest.fn(),
        confirmAuth: jest.fn(),
        awaitAuthConfirm: jest.fn(),
        awaitAccountCreate: jest.fn(),
      },
    };
    storeData = {
      modules: {
        accounts: accountsModule,
        core: coreModule,
      },
    };
    store = new Vuex.Store(storeData);
    wrapper = shallowMount(Auth, {
      localVue,
      store,
    });
  });

  describe('render', () => {
    it('should correctly render Auth component', () => {
      expect(wrapper.name()).toBe('Auth');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should not confirm auth by default on mount', () => {
      expect(accountsModule.actions.confirmAuth).not.toBeCalled();
    });

    it('should not confirm auth if link was sent but authorization status was not changed', () => {
      store.state.accounts.linkSent = true;

      expect(accountsModule.actions.confirmAuth).not.toBeCalled();
    });

    it('should not confirm auth if link was sent and authorization status was changed but account are empty', () => {
      store.state.accounts.linkSent = true;
      store.state.accounts.accounts = [];

      expect(accountsModule.actions.confirmAuth).not.toBeCalled();
    });

    it('should confirm auth if link was sent and authorization status was changed', () => {
      store.state.accounts.linkSent = true;
      store.state.accounts.accounts = ['0x0'];

      expect(accountsModule.actions.confirmAuth).toBeCalled();
    });

    describe('auth form logic', () => {
      it('should request auth on form submit', () => {
        // TODO Have troubles with triggering event from stub, solve it when possivble
        wrapper.vm.handleAuthSubmit('foo@bar.baz');

        expect(accountsModule.actions.auth).toBeCalled();
      });

      it('should cancel auth on form cancel', () => {
        // TODO Have troubles with triggering event from stub, solve it when possivble
        wrapper.vm.handleAuthCancel();

        expect(accountsModule.actions.cancelAuth).toBeCalled();
      });
    });
  });
});
