import chalk from 'chalk'

import { Builder } from '../lib/builder'
import { SingleCommand } from '../types'

interface IParams {
  env?: string
}

const action = async ({ env }: IParams) => {
  const builder = new Builder(env)

  await builder.run().then(() => {
    console.log(chalk.greenBright('Build completed!'))
  })
}

export const build: SingleCommand = {
  command: 'build',
  description: 'build sites',
  action,
  options: [['-e --env <env>', 'set environment', 'prod']],
}
