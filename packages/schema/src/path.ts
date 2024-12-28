// groups/{workspaceId}/reports/{reportId}/sqlite.db
export const getR2Path = ({
  workspaceId,
  reportId,
}: { workspaceId: string; reportId: string }) =>
  `workspaces/${workspaceId}/reports/${reportId}/sqlite.db.gz`;
