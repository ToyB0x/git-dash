// groups/{groupId}/reports/{reportId}/types/{type}/data.json
export const getR2Path = ({
  groupId,
  reportId,
  type,
}: { groupId: string; reportId: string; type: string; version: string }) =>
  `groups/${groupId}/reports/${reportId}/types/${type}/data.json`;
