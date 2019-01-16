import { shallowMount, mount } from '@vue/test-utils';
import OtpForm from '@/components/OtpForm.vue';

describe('OtpForm', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(OtpForm, {
        propsData: {},
      });
    });

    it('should correctly render OtpForm component', () => {
      expect(wrapper.name()).toBe('OtpForm');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
