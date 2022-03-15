import { resolve, basename } from 'path'
import { copyFile, mkdir, writeFile } from 'fs/promises'
import log from 'consola'
import mri from 'mri'

import getDiffFilePaths from './get-diff-file-paths.mjs'

const args = mri(process.argv.splice(2), {
  default: {
    cwd: process.cwd(),
    outDir: './extract'
  }
})

const baseBranch = args._[0]
const targetBranch = args._[1]
log.info(`'${targetBranch}' 브런치에서 변경된 파일 목록을 가져옵니다.`)

const cwd = resolve(args.cwd)
const outDir = resolve(args.outDir)

const pathList = await getDiffFilePaths(baseBranch, targetBranch, cwd)
log.info(`${pathList.length}개의 변경된 파일 발견`)
log.debug('파일 목록: ', pathList)

await mkdir(outDir, { recursive: true })

await Promise.all([
  // 파일 복사
  ...pathList.map((path) => { return copyFile(resolve(cwd, path), resolve(outDir, basename(path))) }),

  // 목록 파일 생성
  writeFile(resolve(outDir, 'README.txt'), pathList.map((path) => `${basename(path)}\n${path}\n\n`))
])

log.success('변경 파일 목록 생성 완료:', outDir)
