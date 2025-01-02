export const getR2Path = ({
  workspaceId,
  reportId,
}: { workspaceId: string; reportId: string }) =>
  `${workspaceId}/${reportId}-sqlite.db.gz`;

export const getR2PathSample = ({
  sampleWorkspaceId,
}: { sampleWorkspaceId: string }) => `${sampleWorkspaceId}-sqlite.db.gz`;
