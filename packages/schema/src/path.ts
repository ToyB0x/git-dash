// teams/{teamId}/reports/{reportId}/types/{type}/data.json
export const getR2Path = ({
  teamId,
  reportId,
  type,
}: { teamId: string; reportId: number; type: string; version: string }) =>
  `teams/${teamId}/reports/${reportId}/types/${type}/data.json`;
