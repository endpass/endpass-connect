import { shallowMount } from '@vue/test-utils';
import VCode from '@@/app/src/components/VCode.vue';

describe('VCode', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(VCode);
    });

    it('should correctly render VCode component', () => {
      expect(wrapper.name()).toBe('VCode');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
