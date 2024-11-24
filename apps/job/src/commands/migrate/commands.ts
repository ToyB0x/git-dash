import { Command } from 'commander'
import { status } from './status'
import { deploy } from './deploy'

export const makeMigrateCommand = () => {
  const migrate = new Command('migrate')
  migrate.description('migrate related commands.')

  migrate
    .command('status')
    .description('show migrate status')
    .action(() => status())

  migrate
    .command('deploy')
    .description('deploy migration')
    .action(() => deploy())

  return migrate
}
