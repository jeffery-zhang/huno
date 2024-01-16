import path from 'path'

import { Config } from './config'

export class Path extends Config {
  constructor(env: string) {
    super(env)
  }

  public get rootPath(): string {
    return path.resolve()
  }
  public get appPath(): string {
    return path.join(__dirname, '..')
  }
  public get contentPath(): string {
    return path.join(this.rootPath, this.contentDir)
  }
  public get publicPath(): string {
    return path.join(this.rootPath, this.publicDir)
  }
  public get customTemplatePath(): string {
    return path.join(this.rootPath, this.templateDir)
  }
  public get defaultTemplatePath(): string {
    return path.join(this.appPath, 'template')
  }
  public get templatePath() {
    if (!this.templateName || this.templateName === 'default') {
      return this.defaultTemplatePath
    } else {
      return path.join(this.customTemplatePath, this.templateName)
    }
  }
  public get partialsPath() {
    return path.join(this.rootPath, this.partialsDir)
  }
  public get outputPath(): string {
    const isDev = this.env === 'dev'
    const outputDir = isDev ? '.temp' : this.outputDir
    return path.join(this.rootPath, outputDir)
  }
  public get pluginsPath(): string {
    return path.join(this.rootPath, this.pluginsDir)
  }
}
