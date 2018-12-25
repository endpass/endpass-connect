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
  });
});
