// teams/{teamId}/reports/{reportId}/types/{type}/versions/{version}/data.json
export const getR2Path = ({
  teamId,
  reportId,
  type,
  version,
}: { teamId: string; reportId: number; type: string; version: string }) =>
  `teams/${teamId}/reports/${reportId}/types/${type}/versions/${version}/data.json`;
