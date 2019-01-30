import { shallowMount, mount } from '@vue/test-utils';
import Sign from '@/components/forms/Sign.vue';

const request = {
  address: '0x0',
  url: 'http://localhost',
  request: {
    foo: 'bar',
  },
};

describe('Sign', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Sign, {
        propsData: {
          request,
        },
      });
    });

    it('should correctly render Sign component', () => {
      expect(wrapper.name()).toBe('SignForm');
      expect(wrapper.find('[data-test=request-body]').exists()).toBe(true);
      expect(wrapper.find('[data-test=requester-url]').text()).toBe(
        request.url,
      );
      expect(wrapper.find('[data-test=error-message]').exists()).toBe(false);
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should not render requester url if it is not passed', () => {
      wrapper = shallowMount(Sign, {
        propsData: {
          request: {
            ...request,
            url: null,
          },
        },
      });

      expect(wrapper.find('[data-test=requester-url]').exists()).toBe(false);
    });

    it('should not render request body code if it is not passed', () => {
      wrapper = shallowMount(Sign, {
        propsData: {
          request: {
            ...request,
            request: null,
          },
        },
      });

      expect(wrapper.find('[data-test=request-body]').exists()).toBe(false);
    });

    it('should change submit button text if loading and make it disabled', () => {
      wrapper = shallowMount(Sign, {
        propsData: {
          loading: true,
          request,
        },
      });

      const submitButton = wrapper.find('[data-test=submit-button]');

      expect(submitButton.text()).toBe('Loading...');
      expect(submitButton.attributes().disabled).toBe('true');
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(Sign, {
        propsData: {
          request,
        },
      });
    });

    it('should not allow submit form if password is empty', () => {
      wrapper.find('form').trigger('submit');

      expect(wrapper.emitted().submit).toBe(undefined);
    });

    it('should allow submit of email is valid', () => {
      wrapper.setData({
        password: 'foo',
      });

      wrapper.find('form').trigger('submit');

      expect(wrapper.emitted().submit).toEqual([
        [
          {
            password: 'foo',
            account: request.address,
          },
        ],
      ]);
    });

    it('should cancel sign on cancel button press', () => {
      wrapper.find('[data-test=cancel-button]').trigger('click');

      expect(wrapper.emitted().cancel).toEqual([[]]);
    });
  });
});
