import { shallowMount, mount } from '@vue/test-utils';
import Message from '@/components/forms/Message.vue';

describe('Message', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Message, {
        propsData: {
          message: 'foo',
        },
      });
    });

    it('should correctly render Message component', () => {
      expect(wrapper.name()).toBe('MessageForm');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(Message, {
        propsData: {
          message: 'foo',
        },
      });
    });

    describe('cancel feature', () => {
      it('should emit close on click cancel button by default', () => {
        wrapper.find('[data-test=cancel-button]').vm.$emit('click');

        expect(wrapper.emitted().cancel).toBeTruthy();
      });
    });
  });
});
