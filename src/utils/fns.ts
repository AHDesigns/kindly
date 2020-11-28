export function not(b: boolean): boolean {
  return !b;
}

export function collect<T, S>(
  predicate: (t: T) => boolean,
  fn: (t: T) => Promise<S>,
) {
  return async (t: T[]): Promise<S[]> => {
    return Promise.all(t.filter(predicate).map(fn));
  };
}

export function unless<T>(predicate: (t: T) => boolean) {
  return (t: T): boolean => {
    return not(predicate(t));
  };
}

export function flatten<T>(args: T[][]): T[] {
  return args.reduce(
    (flattened, item) => item.reduce((p, c) => p.concat(c), flattened),
    [],
  );
}
