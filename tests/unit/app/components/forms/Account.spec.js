import { shallowMount, mount } from '@vue/test-utils';
import Account from '@/components/forms/Account.vue';

describe('Account', () => {
  const componentOptions = {
    propsData: {
      formData: {
        activeAccount: '0x0',
        activeNet: 1,
      },
    },
  };
  let wrapper;

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallowMount(Account, componentOptions);
    });

    it('should correctly render Account component', () => {
      expect(wrapper.name()).toBe('AccountForm');
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render faucet button only if activeNet is ropsten', () => {
      wrapper.setProps({
        formData: {
          activeNet: 3,
        },
      });

      expect(wrapper.find('v-faucet-button-stub').exists()).toBe(true);
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = mount(Account, componentOptions);
    });

    describe('submit feature', () => {
      it('should emit submit on click submit button by default', () => {
        wrapper.find('form').vm.$emit('submit');

        expect(wrapper.emitted().submit).toBeTruthy();
      });
    });

    describe('cancel feature', () => {
      beforeEach(() => {
        wrapper = mount(Account, componentOptions);
      });

      it('should emit close on click cancel button by default', () => {
        wrapper.find('[data-test=cancel-button]').vm.$emit('click');

        expect(wrapper.emitted().cancel).toBeTruthy();
      });
    });
  });
});
