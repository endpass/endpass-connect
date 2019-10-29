import ConnectError from '@/class/ConnectError';

const { ERRORS } = ConnectError;

describe('ConnectError', () => {
  const customMessage = 'my custom msg';

  it('should create error object with code', () => {
    const checkError = new Error('Authentication cancelled by user');

    const err = ConnectError.create(ERRORS.AUTH_CANCELED_BY_USER);

    expect(err).toEqual(checkError);
    expect(err.code).toBe(ERRORS.AUTH_CANCELED_BY_USER);
  });

  it('should create error object with code and custom message', () => {
    const checkError = new Error(customMessage);

    const err = ConnectError.create(
      ERRORS.AUTH_CANCELED_BY_USER,
      customMessage,
    );

    expect(err).toEqual(checkError);
    expect(err.code).toBe(ERRORS.AUTH_CANCELED_BY_USER);
    expect(err.message).toBe(customMessage);
  });

  it('should pass already created error without code', () => {
    const checkError = new Error(customMessage);

    const err = ConnectError.createFromError(
      checkError,
      ERRORS.AUTH_CANCELED_BY_USER,
    );

    expect(err).toEqual(checkError);
    expect(err.code).toBe(ERRORS.AUTH_CANCELED_BY_USER);
    expect(err.message).toBe(customMessage);
  });

  it('should pass already created error with default code', () => {
    const checkError = new ConnectError(customMessage);

    const err = ConnectError.createFromError(
      checkError,
      ERRORS.AUTH_CANCELED_BY_USER,
    );

    expect(err).toBe(checkError);
    expect(err.code).toBe(ERRORS.NOT_DEFINED);
  });

  it('should rewrite error to ConnectError', () => {
    const checkError = new Error(customMessage);
    checkError.code = 'some-other-code';

    const err = ConnectError.createFromError(
      checkError,
      ERRORS.AUTH_CANCELED_BY_USER,
    );

    expect(err).toBeInstanceOf(ConnectError);
    expect(err.code).toBe(ERRORS.AUTH_CANCELED_BY_USER);
  });

  it('should pass error as text', () => {
    const checkError = ConnectError.create(ERRORS.AUTH_CANCELED_BY_USER);

    const err = ConnectError.createFromError(
      customMessage,
      ERRORS.AUTH_CANCELED_BY_USER,
    );

    expect(err).toEqual(checkError);
    expect(err.code).toBe(ERRORS.AUTH_CANCELED_BY_USER);
    expect(err.code).toBe(checkError.code);
    expect(err.message).toBe(checkError.message);
  });
});
