// groups/{workspaceId}/reports/{reportId}/types/{type}/data.json
export const getR2Path = ({
  workspaceId,
  reportId,
  type,
}: { workspaceId: string; reportId: string; type: string }) =>
  `workspaces/${workspaceId}/reports/${reportId}/types/${type}/data.json`;
