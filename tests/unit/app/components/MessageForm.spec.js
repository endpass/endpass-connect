import { shallowMount, mount } from '@vue/test-utils';
import MessageForm from '@/components/MessageForm.vue';

describe('MessageForm', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(MessageForm, {
        propsData: {
          message: 'foo',
        },
      });
    });

    it('should correctly render MessageForm component', () => {
      expect(wrapper.name()).toBe('MessageForm');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(MessageForm, {
        propsData: {
          message: 'foo',
        },
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
