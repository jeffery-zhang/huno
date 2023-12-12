import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import inquirer from 'inquirer'

import { Path } from '../lib/path'
import { SingleCommand } from '../types'

const action = async (projectName: string) => {
  let name: string
  if (!projectName) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Please name your project first: ',
      },
    ])
    name = answer.name
  } else {
    name = projectName
  }

  const paths = new Path('new')
  const inputPath = path.join(paths.hunoRootPath, 'starter')
  const targetPath = path.join(paths.rootPath, name)

  fs.cp(inputPath, targetPath, { recursive: true }, (err) => {
    if (err) {
      console.log(chalk.redBright(`Generate new project failed\n${err}`))
      process.exit(1)
    }
    console.log(chalk.greenBright('Generate project starter files completed!'))
  })
}

export const newCmd: SingleCommand = {
  command: 'new',
  description: 'generate starter project',
  action,
  arguments: [['[projectName]', 'project name']],
}
