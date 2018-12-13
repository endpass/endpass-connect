import { shallowMount } from '@vue/test-utils';
import FormField from '@@/app/src/components/FormField.vue';

describe('FormField', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(FormField);
    });

    it('should correctly render FormField component without label by default', () => {
      expect(wrapper.name()).toBe('FormField');
      expect(wrapper.find('.form-field__label').exists()).toBe(false);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render label if it passed', () => {
      wrapper = shallowMount(FormField, {
        propsData: {
          label: 'foo',
        },
      });

      expect(wrapper.find('.form-field__label').text()).toBe('foo');
    });
  });
});
