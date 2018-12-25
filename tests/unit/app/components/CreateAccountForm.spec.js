import { shallowMount, mount } from '@vue/test-utils';
import CreateAccountForm from '@@/app/src/components/CreateAccountForm.vue';

describe('CreateAccountForm', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(CreateAccountForm, {
        propsData: {},
      });
    });

    it('should correctly render CreateAccountForm component', () => {
      expect(wrapper.name()).toBe('CreateAccountForm');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(CreateAccountForm, {
        propsData: {},
      });
    });

    describe('submit feature', () => {
      it('should emit request on click submit button by default', () => {
        wrapper.find('[data-test=submit-button]').trigger('click');

        expect(wrapper.emitted().request).toBeTruthy();
      });
    });

    describe('cancel feature', () => {
      it('should emit close on click cancel button by default', () => {
        wrapper.find('[data-test=cancel-button]').trigger('click');

        expect(wrapper.emitted().cancel).toBeTruthy();
      });

      it('should not emit close on click cancel button if closable is false', () => {
        wrapper.setProps({
          closable: false,
        });

        wrapper.find('[data-test=cancel-button]').trigger('click');

        expect(wrapper.emitted().cancel).toBeFalsy();
      });
    });
  });
});
