export const getR2Path = ({
  workspaceId,
  reportId,
}: { workspaceId: string; reportId: string }) =>
  `${workspaceId}/${reportId}-sqlite.db.gz`;
