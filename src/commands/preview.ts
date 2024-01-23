import { Huno } from '../lib/huno'
import { SingleCommand } from '../types'

const action = async () => {
  const huno = new Huno('prod')
  huno.preview()
}

export const preview: SingleCommand = {
  command: 'preview',
  description: 'preview sites',
  action,
}
