import { shallowMount } from '@vue/test-utils';
import Otp from '@/components/forms/Otp.vue';

describe('Otp', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Otp, {
        propsData: {},
      });
    });

    it('should correctly render Otp component', () => {
      expect(wrapper.name()).toBe('OtpForm');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
