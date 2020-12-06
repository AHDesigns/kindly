export enum FileType {
  FILE = 'FILE',
  DIR = 'DIR',
  LINK = 'LINK',
}

type FileInfo = { name: string; type: FileType };

export type LinkedFiles = {
  linked: FileInfo[];
  failed: FileInfo[];
  ignored: FileInfo[];
};

export function linkedFilesFactory(
  linkedFilesResult: Partial<LinkedFiles> = {},
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

export function getFileNames(fileInfos: FileInfo[]): string[] {
  return fileInfos.map(({ name }) => name);
}
