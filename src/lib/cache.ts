import path from 'path'
import fs from 'fs'

export class Cache {
  constructor(stage: 'dev' | 'build') {
    this._stage = stage
    this.readCache()
  }

  private _stage: 'dev' | 'build'
  private _cachePath = path.join(path.resolve(), '.huno')
  private _cacheData: { [key: string]: any } = {}

  private get cacheExists() {
    return fs.existsSync(this.cacheTarget)
  }

  private get cacheTarget() {
    return path.join(this._cachePath, this._stage)
  }

  readCache() {
    const target = path.join(this.cacheTarget, 'cached.json')
    if (this.cacheExists) {
      const data = fs.readFileSync(target, 'utf-8') || '{}'
      this._cacheData = JSON.parse(data)
    }
  }

  writeCache() {
    if (!this.cacheExists) {
      fs.mkdirSync(this.cacheTarget, { recursive: true })
    }
    const target = path.join(this.cacheTarget, 'cached.json')
    fs.writeFileSync(target, JSON.stringify(this._cacheData), 'utf-8')
  }

  hasChanged(absoluteFilePath: string, mtimeMs: number) {
    const lastModified = mtimeMs
    const cachedLastModified = this._cacheData[absoluteFilePath]
    return !cachedLastModified || lastModified > cachedLastModified
  }

  updateCache(absoluteFilePath: string, mtimeMs: number) {
    const lastModified = mtimeMs
    this._cacheData[absoluteFilePath] = lastModified
  }
}
