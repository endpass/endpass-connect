import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Bridge from '@/components/Bridge.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('Bridge', () => {
  let wrapper;
  let store;
  let coreModule;

  beforeEach(() => {
    coreModule = {
      actions: {
        subscribeOnBridge: jest.fn(),
      },
    };
    store = new Vuex.Store({
      modules: {
        core: coreModule,
      },
    });
    wrapper = shallowMount(Bridge, {
      store,
      localVue,
    });
  });

  describe('render', () => {
    it('should render "empty" markup', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should subscribe on bride after create', () => {
      expect(coreModule.actions.subscribeOnBridge).toBeCalled();
    });
  });
});
