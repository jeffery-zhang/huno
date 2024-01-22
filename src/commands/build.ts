import { Huno } from '../lib/huno'
import { SingleCommand } from '../types'

interface IParams {
  env?: string
}

const action = async ({ env }: IParams) => {
  const huno = new Huno(env!)
  huno.build()
}

export const build: SingleCommand = {
  command: 'build',
  description: 'build sites',
  action,
  options: [['-e --env <env>', 'set environment', 'prod']],
}
