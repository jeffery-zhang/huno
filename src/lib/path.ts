import path from 'path'

import { Config } from './config'

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
    const isDev = this.env === 'dev'
    const outputDir = isDev ? '.temp' : this.outputDir
    return path.join(this.rootPath, outputDir)
  }
  get outputContentPath() {
    return path.join(this.outputPath, this.contentDir)
  }
  get outputSearchPath() {
    if (!this.outputSearchDir) {
      return null
    }
    return path.join(this.outputPath, this.outputSearchDir)
  }
  get outputCategoryPath() {
    if (!this.outputCategoryDir) {
      return null
    }
    return path.join(this.outputPath, this.outputCategoryDir)
  }
  get customTemplatePath(): string {
    return path.join(this.rootPath, this.templateDir)
  }
  get defaultTemplatePath(): string {
    return path.join(this.hunoRootPath, 'template')
  }
  get templatePath() {
    if (!this.templateName || this.templateName === 'default') {
      return this.defaultTemplatePath
    } else {
      return path.join(this.customTemplatePath, this.templateName)
    }
  }
  get templateAssetsPath() {
    return path.join(this.templatePath, 'assets')
  }
  get publicPath(): string {
    return path.join(this.rootPath, this.publicDir)
  }
}
