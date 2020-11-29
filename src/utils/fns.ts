export function not(b: boolean): boolean {
  return !b;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notP(fn: (...args: any[]) => Promise<boolean>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (...args: any[]): Promise<boolean> => {
    return !(await fn(...args));
  };
}

export function map<T, S>(fn: (t: T) => Promise<S>) {
  return async (t: T[]): Promise<S[]> => {
    return Promise.all(t.map(fn));
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
