import { shallowMount, mount } from '@vue/test-utils';
import Auth from '@/components/forms/Auth.vue';

describe('Auth', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Auth, {
        propsData: {
          inited: true,
        },
      });
    });

    it('should correctly render Auth component', () => {
      expect(wrapper.name()).toBe('Auth');
      expect(wrapper.find('[data-test=email-input]').exists()).toBe(true);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render error', () => {
      wrapper = shallowMount(Auth, {
        propsData: {
          message: 'foo',
          error: 'bar',
        },
      });

      expect(wrapper.findAll('[data-test=error-message]').exists()).toBe(true);
    });

    it('should change submit button text if loading and make it disabled', () => {
      wrapper = shallowMount(Auth, {
        propsData: {
          message: 'foo',
          loading: true,
        },
      });

      const submitButton = wrapper.find('[data-test=submit-button]');

      expect(wrapper.html()).toMatchSnapshot();
      expect(submitButton.text()).toBe('Loading...');
      expect(submitButton.attributes().disabled).toBe('true');
    });
  });

  describe('behavior', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(Auth, {
        propsData: {
          message: 'foo',
          inited: true,
        },
      });
    });

    it('should not allow submit form if email is empty', () => {
      wrapper.find('form').trigger('submit');

      expect(wrapper.emitted().submit).toBe(undefined);
    });

    it('should not allow submit form if email is empty', () => {
      wrapper.setData({
        email: 'foo@bar',
      });

      wrapper.find('form').trigger('submit');

      expect(wrapper.emitted().submit).toBe(undefined);
    });

    it('should allow submit of email is valid', () => {
      wrapper.setData({
        email: 'foo@bar.baz',
      });

      wrapper.find('form').trigger('submit');

      expect(wrapper.emitted().submit).toEqual([['foo@bar.baz']]);
    });

    it('should cancel auth on cancel button press', () => {
      wrapper.find('[data-test=cancel-button]').trigger('click');

      expect(wrapper.emitted().cancel).toEqual([[]]);
    });
  });
});
