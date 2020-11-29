import { cond } from './composables';

describe.only('composables', () => {
  describe('cond', () => {
    it('invokes an fn where predicate passes', async () => {
      const returnValue = 'some value';
      const spy = jest.fn().mockResolvedValue(returnValue);
      const fn = cond([[() => Promise.resolve(true), spy]]);
      const res = await fn('');

      expect(spy).toHaveBeenCalled();
      expect(res).toBe(returnValue);
    });

    it('only invokes the fn where predicate passes', async () => {
      const returnValue = 'some value';
      const spy = jest.fn().mockResolvedValue(returnValue);
      const spy2 = jest.fn().mockResolvedValue(returnValue);

      await cond([
        [() => Promise.resolve(false), spy2],
        [() => Promise.resolve(true), spy],
      ])('');

      expect(spy2).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();

      spy.mockClear();

      await cond([
        [() => Promise.resolve(true), spy2],
        [() => Promise.resolve(false), spy],
      ])('');

      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it('throws an error when there is no match', async () => {
      function asserIsError(err: unknown): asserts err is Error {
        if (!(err instanceof Error)) throw new Error('A non error was thrown');
      }

      const spy = jest.fn().mockResolvedValue(null);

      let err: Error | null = null;
      try {
        await cond([
          [() => Promise.resolve(false), spy],
          [() => Promise.resolve(false), spy],
        ])('');
      } catch (error: unknown) {
        asserIsError(error);
        err = error;
      }
      expect(err).toEqual(expect.any(Error));

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
