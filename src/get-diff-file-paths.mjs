import log from 'consola'

import { promisify } from 'util'
import { exec } from 'child_process'
import { basename } from 'path'
const execAsync = promisify(exec)

export default async function (baseBranch, targetBranch, cwd) {
  const { stdout } = await execAsync(`git diff --name-only ${baseBranch} ${targetBranch}`, {
    cwd
  }).catch((e) => {
    let errorMessage = e.stderr

    if (errorMessage.includes('Could not access ')) {
      const branchName = errorMessage.replace('error: Could not access ', '').replace('\n', '')

      errorMessage = `${branchName} 브런치를 찾을 수 없습니다.`
      errorMessage += `\n\t브런치 이름 혹은 경로가 올바른지 확인해주세요.`
    }

    log.error(errorMessage)
    process.exit(1)
  })

  const pathList = stdout.split('\n')
  pathList.pop() // 마지막 빈 값 제거

  return pathList.sort((prev, next) => {
    const prevFilename = basename(prev)
    const nextFilename = basename(next)

    return prevFilename.localeCompare(nextFilename)
  })
}
