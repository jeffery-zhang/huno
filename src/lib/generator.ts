import { Path } from './path'

export class Generator {
  constructor(path: Path) {
    if (!path) {
      throw new Error('Path is required in generator')
    }
    this._path = path
  }

  private _path: Path
}
