import { Config } from '../lib/config'
import { SingleCommand } from '../types'

interface IParams {
  env?: string
}

const action = async ({ env }: IParams) => {
  const builder = new Builder(env)

  builder.run()
}

export const build: SingleCommand = {
  command: 'build',
  description: 'build sites',
  action,
  options: [['-e --env <env>', 'set environment', 'prod']],
}

export class Builder {
  constructor(env?: string) {
    this._config = new Config(env)
  }

  private _config: Config | null = null

  run() {
    console.log(this._config)
  }
}
