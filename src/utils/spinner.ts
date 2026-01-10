import ora, { Ora } from 'ora';

export async function withSpinner<T>(
  message: string,
  action: () => Promise<T>
): Promise<T> {
  const spinner = ora({
    text: message,
    color: 'cyan',
    spinner: 'dots'
  }).start();
  
  try {
    const result = await action();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
}