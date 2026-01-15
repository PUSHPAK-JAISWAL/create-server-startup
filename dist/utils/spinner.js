import ora from 'ora';
export async function withSpinner(message, action) {
    const spinner = ora({
        text: message,
        color: 'cyan',
        spinner: 'dots'
    }).start();
    try {
        const result = await action();
        spinner.succeed();
        return result;
    }
    catch (error) {
        spinner.fail();
        throw error;
    }
}
//# sourceMappingURL=spinner.js.map