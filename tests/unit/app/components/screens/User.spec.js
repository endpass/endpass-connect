import Vuex from 'vuex';
import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import User from '@/components/screens/User.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('User', () => {
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
      getters: {
        isDialog: jest.fn(() => true),
      },
    };
    accountsModule = {
      state: {
        linkSent: false,
        accounts: null,
        settings: {
          lastActiveAccount: '0x0',
          net: 1,
        },
      },
      actions: {
        logout: jest.fn(),
        closeAccount: jest.fn(),
        updateSettings: jest.fn(),
        getAccounts: jest.fn(),
      },
      getters: {
        availableAccounts: jest.fn(() => [
          {
            address: '0x0',
            type: 'StandardAccount',
          },
        ]),
      },
    };
    storeData = {
      modules: {
        accounts: accountsModule,
        core: coreModule,
      },
    };
    store = new Vuex.Store(storeData);
    wrapper = shallowMount(User, {
      localVue,
      store,
    });
  });

  describe('render', () => {
    it('should correctly render User component', () => {
      expect(wrapper.name()).toBe('User');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should set form data from settings on create', () => {
      expect(wrapper.vm.formData).toEqual({
        activeAccount: '0x0',
        activeNet: 1,
      });
    });

    it('should update settings of form submit', () => {
      const { activeAccount, activeNet } = wrapper.vm.formData;

      wrapper.find('account-form-stub').vm.$emit('submit');

      expect(accountsModule.actions.updateSettings).toBeCalledWith(
        expect.any(Object),
        {
          lastActiveAccount: activeAccount,
          net: activeNet,
        },
        undefined,
      );
    });

    it('should logout if logout button was pressed in form', () => {
      wrapper.find('account-form-stub').vm.$emit('logout');

      expect(accountsModule.actions.logout).toBeCalled();
    });

    it('should close account if cancel button was pressed in form', () => {
      wrapper.find('account-form-stub').vm.$emit('cancel');

      expect(accountsModule.actions.closeAccount).toBeCalled();
    });
  });

  // describe('watchers', () => {
  //   it('should do something', () => {
  //     expect('1 + 1').toBe(2)
  //   })
  // })
});
