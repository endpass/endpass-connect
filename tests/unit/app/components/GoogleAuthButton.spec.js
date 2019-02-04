import { shallowMount } from '@vue/test-utils';
import GoogleAuthButton from '@/components/FormField.vue';

describe('GoogleAuthButton', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(GoogleAuthButton);
    });

    it('should correctly render GoogleAuthButton component empty if auth2 isn\'t loaded', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should correctly render GoogleAuthButton component if auth2 is loaded', () => {
      wrapper.setData({
        auth2Loaded: true
      });
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
