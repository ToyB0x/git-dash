import process from 'process'
import { createInterface } from 'readline'

/**
 * ユーザーに値を入力させる
 */
export const prompt = async (msg: string) => {
  console.log(msg)
  const answer = await question('> ')
  return answer.trim()
}

/**
 * ユーザーにYes/Noで答えられる質問をする
 */
export const confirm = async (msg: string) => {
  const answer = await question(`${msg} (yes / no): `)
  if (answer.trim().toLowerCase() === 'yes') return

  console.info('yes以外が入力されたため終了します')
  process.exit(0)
}

/**
 * 標準入力を取得する
 */
const question = (question: string): Promise<string> => {
  const readlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) => {
    readlineInterface.question(question, (answer) => {
      resolve(answer)
      readlineInterface.close()
    })
  })
}
