import path from 'path'

import { Config } from './config'

export class Path extends Config {
  constructor(env: string) {
    super(env)
  }

  get rootPath(): string {
    return path.resolve()
  }
  get appPath(): string {
    return path.join(__dirname, '..')
  }
  get contentPath(): string {
    return path.join(this.rootPath, this.contentDir)
  }
  get publicPath(): string {
    return path.join(this.rootPath, this.publicDir)
  }
  get customTemplatePath(): string {
    return path.join(this.rootPath, this.templateDir)
  }
  get defaultTemplatePath(): string {
    return path.join(this.appPath, 'template')
  }
  get templatePath() {
    if (!this.templateName || this.templateName === 'default') {
      return this.defaultTemplatePath
    } else {
      return path.join(this.customTemplatePath, this.templateName)
    }
  }
  get outputPath(): string {
    const isDev = this.env === 'dev'
    const outputDir = isDev ? '.temp' : this.outputDir
    return path.join(this.rootPath, outputDir)
  }

  public getEncodedUrl(url: string) {
    return url
      .split('/')
      .map((u) => encodeURI(u))
      .join('/')
  }
}
