import path from 'path'

import { Config } from './config'
import { CoreConfig } from '../types'

export class Path extends Config {
  constructor(env: string) {
    super(env)
  }

  get rootPath(): string {
    return path.resolve()
  }
  get hunoRootPath(): string {
    return path.join(__dirname, '..')
  }
  get contentPath(): string {
    return path.join(this.rootPath, this.contentDir)
  }
  get outputPath(): string {
    return path.join(this.rootPath, this.outputDir)
  }
  get customTemplatePath(): string {
    return path.join(this.rootPath, this.templateDir)
  }
  get defaultTemplatePath(): string {
    return path.join(this.hunoRootPath, 'template')
  }
  get publicPath(): string {
    return path.join(this.rootPath, this.publicDir)
  }
}
