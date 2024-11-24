import { getSingleTenantPrismaClient } from '../../../utils'
import { aggregateRepositories } from './aggregateRepositories'
import { aggregatePRs } from './aggregatePRs'
import { aggregateUsers } from './aggregateUsers'
import { aggregateOrganization } from './aggregateOrganization'

export const maxOld = new Date(
  Date.now() - 60 * 60 * 24 * 30 * 6 * 1000,
).getTime() // half year

export const aggregateByOrganization = async (
  orgName: string,
): Promise<void> => {
  // TODO: orgIdを利用してRLSを有効化(/apps/jobs)
  // https://github.com/users/ToyB0x/projects/1/views/1?pane=issue&itemId=32240414

  const organizationId = await aggregateOrganization(orgName)
  await aggregateUsers(orgName, organizationId)
  const repositoryNames = await aggregateRepositories(orgName, organizationId)
  if (repositoryNames.length !== new Set(repositoryNames).size)
    throw new Error('duplicate repository name')

  for (const [index, repositoryName] of repositoryNames.entries()) {
    console.info(`trying repository: ${index + 1} / ${repositoryNames.length}`)
    await aggregatePRs(orgName, organizationId, repositoryName)
  }
}
