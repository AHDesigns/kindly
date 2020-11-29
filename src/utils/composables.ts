export function map<T, S>(fn: (t: T) => Promise<S>) {
  return async (t: T[]): Promise<S[]> => {
    return Promise.all(t.map(fn));
  };
}

export function cond<I, O>(
  branches: [(t: I) => Promise<boolean>, (t: I) => Promise<O>][],
) {
  return async (input: I): Promise<O> => {
    for await (const [predicate, handler] of branches) {
      if (await predicate(input)) {
        return handler(input);
      }
    }
    throw new Error('no match');
  };
}

export async function always(): Promise<boolean> {
  return Promise.resolve(true);
}
