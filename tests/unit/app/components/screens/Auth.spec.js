import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Auth from '@/components/screens/Auth.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('Auth', () => {
  let store;
  let storeData;
  let wrapper;
  let accountsModule;
  let coreModule;

  beforeEach(() => {
    jest.clearAllMocks();

    coreModule = {
      state: {
        inited: true,
        loading: false,
      },
      actions: {
        openCreateAccountPage: jest.fn(),
      },
      getters: {
        isDialog: jest.fn(() => true),
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
        awaitAuthMessage: jest.fn(),
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

    it('should render create account form if user authorized but does not have any account', () => {
      store.state.accounts.accounts = [];

      expect(wrapper.find('create-account-form-stub').exists()).toBe(true);
      expect(wrapper.html()).toMatchSnapshot();
    });

    // TODO: magical thing, doesn't work, fix it as soon as it possible
    //   it('should render opt form if opt email is not null', () => {
    //     store.state.accounts.otpEmail = 'foo@bar.baz';
    //
    //     expect(wrapper.html()).toBe(1);
    //     expect(wrapper.find('otp-form-stub').exists()).toBe(true);
    //   });

    it('should render message form if link sent but user is not authorized', () => {
      store.state.accounts.linkSent = true;
      store.state.accounts.accounts = null;

      expect(wrapper.find('message-form-stub').exists()).toBe(true);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render auth form in other cases', () => {
      expect(wrapper.find('auth-form-stub').exists()).toBe(true);
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    describe('initial actions', () => {
      // TODO: another magic moment
      //       it('should not do anything if it opened not in dialog', async () => {
      //         expect.assertions(3);
      //
      //         coreModule.getters.isDialog.mockReturnValueOnce(false);
      //         store = new Vuex.Store(storeData);
      //         wrapper = shallowMount(Auth, {
      //           localVue,
      //           store,
      //         });
      //
      //         await global.flushPromises();
      //
      //         expect(coreModule.actions.init).toBeCalled();
      //         expect(accountsModule.actions.awaitAuthMessage).not.toBeCalled();
      //         expect(coreModule.actions.sendReadyMessage).not.toBeCalled();
      //       });
    });

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

    it('should cancel auth on form cancel', () => {
      // TODO Have troubles with triggering event from stub, solve it when possivble
      wrapper.vm.handleAuthCancel();

      expect(accountsModule.actions.cancelAuth).toBeCalled();
    });

    describe('create account form logic', () => {
      it('should open create account page on request event handling', () => {
        wrapper.vm.handleAccountRequest();

        expect(coreModule.actions.openCreateAccountPage).toBeCalled();
      });
    });

    describe('auth form logic', () => {
      it('should request auth on form submit', () => {
        // TODO Have troubles with triggering event from stub, solve it when possivble
        wrapper.vm.handleAuthSubmit('foo@bar.baz');

        expect(accountsModule.actions.auth).toBeCalled();
      });
    });
  });
});
