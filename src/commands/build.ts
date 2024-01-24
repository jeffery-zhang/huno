import { Huno } from '../lib/huno'
import { SingleCommand } from '../types'

interface IParams {
  env?: string
}

const action = async ({ env }: IParams) => {
  new Huno(env!, 'build')
}

export const build: SingleCommand = {
  command: 'build',
  description: 'build sites',
  action,
  options: [['-e --env <env>', 'set environment', 'prod']],
}
