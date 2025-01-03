export const getR2Path = ({ workspaceId }: { workspaceId: string }) =>
  `${workspaceId}-sqlite.db.gz`; // NOTE: use fix db with overwrite as trial

export const getR2PathSample = ({
  sampleWorkspaceId,
}: { sampleWorkspaceId: string }) => `${sampleWorkspaceId}-sqlite.db.gz`;
