import { shallowMount, mount } from '@vue/test-utils';
import Account from '@/components/forms/Account.vue';

describe('Account', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Account, {
        propsData: {},
      });
    });

    it('should correctly render Account component', () => {
      expect(wrapper.name()).toBe('Account');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(Account, {
        propsData: {},
      });
    });

    describe('submit feature', () => {
      it('should emit submit on click submit button by default', () => {
        wrapper.find('form').trigger('submit');

        expect(wrapper.emitted().submit).toBeTruthy();
      });

      it('should not emit submit on click submit button if it is loading', () => {
        wrapper.setProps({
          loading: true,
        });

        wrapper.find('form').trigger('submit');

        expect(wrapper.emitted().submit).toBeFalsy();
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
