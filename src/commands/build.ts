import { Config } from '../lib/config'
import { Path } from '../lib/path'
import { Template } from '../lib/template'
import { Compiler } from '../lib/compiler'
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
  constructor(env?: string) {}

  private _env: string = 'prod'
  private _config: Config | null = null

  run() {
    const template = new Template(this._env)
    const compiler = new Compiler(template)
    console.log(compiler)
  }
}
