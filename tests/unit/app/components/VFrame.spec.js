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
      expect(wrapper.find('[data-test="close-button"]').exists()).toBe(true);
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

    it('should not render close button', () => {
      wrapper = shallowMount(VFrame, {
        propsData: {
          closable: false,
        },
      });

      expect(wrapper.find('[data-test=close-button]').exists()).toBe(false);
    });

    describe('close feature', () => {
      it('should emit close on click close button by default', () => {

        wrapper.find('[data-test=close-button]').vm.$emit('click');

        expect(wrapper.emitted().close).toBeTruthy();
      });
    });
  });
});
