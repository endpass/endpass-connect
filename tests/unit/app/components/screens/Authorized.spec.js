import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Authorized from '@@/app/src/components/screens/Authorized.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('Authorized', () => {
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
        init: jest.fn(),
        sendReadyMessage: jest.fn(),
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
        logout: jest.fn(),
        cancelLogout: jest.fn(),
      },
    };
    storeData = {
      modules: {
        accounts: accountsModule,
        core: coreModule,
      },
    };
    store = new Vuex.Store(storeData);
    wrapper = shallowMount(Authorized, {
      localVue,
      store,
    });
  });

  describe('render', () => {
    it('should correctly render Authorized component', () => {
      expect(wrapper.name()).toBe('Authorized');
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render logout form by default', () => {
      expect(wrapper.find('logout-form-stub').exists()).toBe(true);
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should init and send ready message if opened in dialog', async () => {
      expect.assertions(2);

      await global.flushPromises();

      expect(coreModule.actions.init).toBeCalled();
      expect(coreModule.actions.sendReadyMessage).toBeCalled();
    });

    it('should call logout action on logout form submit', () => {
      // TODO Have troubles with triggering event from stub, solve it when possivble
      wrapper.vm.handleLogoutSubmit();

      expect(accountsModule.actions.logout).toBeCalled();
    });

    it('should call cancel logout action on logout form cancel', () => {
      // TODO Have troubles with triggering event from stub, solve it when possivble
      wrapper.vm.handleLogoutCancel();

      expect(accountsModule.actions.cancelLogout).toBeCalled();
    });
  });
});
