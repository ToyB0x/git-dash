// groups/{workspaceId}/reports/{reportId}/types/{type}/data.json
export const getR2Path = ({
  workspaceId,
  reportId,
  type,
}: { workspaceId: string; reportId: string; type: string; version: string }) =>
  `groups/${workspaceId}/reports/${reportId}/types/${type}/data.json`;
