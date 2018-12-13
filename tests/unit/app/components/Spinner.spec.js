import { shallowMount } from '@vue/test-utils';
import Spinner from '@@/app/src/components/Spinner.vue';

describe('Spinner', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Spinner);
    });

    it('should correctly render Spinner component', () => {
      expect(wrapper.name()).toBe('Spinner');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
