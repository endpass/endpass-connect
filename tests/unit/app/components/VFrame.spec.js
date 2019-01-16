import { shallowMount } from '@vue/test-utils';
import VFrame from '@/components/VFrame.vue';

describe('VFrame', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(VFrame);
    });

    it('should correctly render VFrame component without loading screen by default', () => {
      expect(wrapper.name()).toBe('VFrame');
      expect(wrapper.find('loading-screen-stub').exists()).toBe(false);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render loading screen if loading passed as true', () => {
      wrapper = shallowMount(VFrame, {
        propsData: {
          loading: true,
        },
      });

      expect(wrapper.find('loading-screen-stub').exists()).toBe(true);
    });
  });
});
