import { not } from './fns';

describe('fns', () => {
  describe('not', () => {
    it('negates the boolean value passed to it', () => {
      expect(not(true)).toBe(false);
      expect(not(false)).toBe(true);
    });
  });
});
