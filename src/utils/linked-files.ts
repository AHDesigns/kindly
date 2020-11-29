export type LinkedFiles = {
  linked: string[];
  failed: string[];
  ignored: string[];
};

export function linkedFilesFactory(
  linkedFilesResult: Partial<LinkedFiles>,
): LinkedFiles {
  return {
    linked: linkedFilesResult.linked || [],
    failed: linkedFilesResult.failed || [],
    ignored: linkedFilesResult.ignored || [],
  };
}

export function mergeLinkedFiles(
  linkedFilesResults: LinkedFiles[],
): LinkedFiles {
  return linkedFilesResults.reduce(
    (combined, { failed, linked, ignored }) => ({
      failed: [...combined.failed, ...failed],
      linked: [...combined.linked, ...linked],
      ignored: [...combined.ignored, ...ignored],
    }),
    linkedFilesFactory({}),
  );
}
