import { not, doWhen } from './fns';

describe.only('fns', () => {
  describe('not', () => {
    it('negates the boolean value passed to it', () => {
      expect(not(true)).toBe(false);
      expect(not(false)).toBe(true);
    });
  });

  describe('doWhen', () => {
    it('invokes an fn where predicate passes', async () => {
      const returnValue = 'some value';
      const spy = jest.fn().mockResolvedValue(returnValue);
      const fn = doWhen([[() => Promise.resolve(true), spy]]);
      const res = await fn('');

      expect(spy).toHaveBeenCalled();
      expect(res).toBe(returnValue);
    });

    it('only invokes the fn where predicate passes', async () => {
      const returnValue = 'some value';
      const spy = jest.fn().mockResolvedValue(returnValue);
      const spy2 = jest.fn().mockResolvedValue(returnValue);

      await doWhen([
        [() => Promise.resolve(false), spy2],
        [() => Promise.resolve(true), spy],
      ])('');

      expect(spy2).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();

      spy.mockClear();

      await doWhen([
        [() => Promise.resolve(true), spy2],
        [() => Promise.resolve(false), spy],
      ])('');

      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it('throws an error when there is no match', async () => {
      const spy = jest.fn().mockResolvedValue(null);

      let err: Error | null = null;
      try {
        await doWhen([
          [() => Promise.resolve(false), spy],
          [() => Promise.resolve(false), spy],
        ])('');
      } catch (error) {
        err = error;
      }
      expect(err).toEqual(expect.any(Error));

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
