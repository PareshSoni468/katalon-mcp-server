import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as xml2js from 'xml2js';

export interface ExecutionResult {
    success: boolean;
    exitCode: number;
    executionId: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    testResults: TestResult[];
    reportPath?: string;
    logPath?: string;
    screenshots?: string[];
}

export interface TestResult {
    testCaseName: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';
    duration: number;
    errorMessage?: string;
    screenshots?: string[];
}

export interface ExecutionOptions {
    projectPath: string;
    testSuitePath: string;
    browser?: string;
    executionProfile?: string;
    browserConfig?: BrowserConfig;
    reportFolder?: string;
    consoleLog?: boolean;
    retry?: number;
}

interface BrowserConfig {
    browserType: string;
    headless?: boolean;
    windowSize?: string;
    userAgent?: string;
    arguments?: string[];
}

/**
 * Katalon Test Executor
 * Handles execution of Katalon test suites and test suite collections
 */
export class KatalonTestExecutor {
    private parser = new xml2js.Parser();
    private runningProcesses: Map<string, ChildProcess> = new Map();

    /**
     * Execute a Katalon test suite or test suite collection
     */
    async executeTestSuite(args: any): Promise<{ content: any[] }> {
        const options: ExecutionOptions = {
            projectPath: args.projectPath,
            testSuitePath: args.testSuitePath,
            browser: args.browser || 'Chrome',
            executionProfile: args.executionProfile || 'default',
            browserConfig: args.browserConfig,
            reportFolder: args.reportFolder,
            consoleLog: args.consoleLog !== false,
            retry: args.retry || 0,
        };

        try {
            const result = await this.executeTest(options);
            return {
                content: [
                    {
                        type: 'text',
                        text: this.formatExecutionResult(result),
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Test execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Execute test with detailed configuration
     */
    private async executeTest(options: ExecutionOptions): Promise<ExecutionResult> {
        const executionId = this.generateExecutionId();
        const startTime = new Date();

        // Validate inputs
        await this.validateExecution(options);

        // Find Katalon Runtime Engine
        const katalonCommand = await this.findKatalonCommand();

        // Build command arguments
        const args = await this.buildExecutionArgs(options, executionId);

        // Execute the test
        const { exitCode, output } = await this.runKatalonCommand(katalonCommand, args, executionId);

        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        // Parse results
        const testResults = await this.parseExecutionResults(options.projectPath, executionId);

        // Get report and log paths
        const reportPath = await this.getReportPath(options.projectPath, executionId);
        const logPath = await this.getLogPath(options.projectPath, executionId);

        return {
            success: exitCode === 0,
            exitCode,
            executionId,
            startTime,
            endTime,
            duration,
            testResults,
            reportPath,
            logPath,
            screenshots: await this.getScreenshots(options.projectPath, executionId),
        };
    }

    private async validateExecution(options: ExecutionOptions): Promise<void> {
        // Check if project path exists
        if (!await fs.pathExists(options.projectPath)) {
            throw new Error(`Project path does not exist: ${options.projectPath}`);
        }

        // Check if it's a valid Katalon project
        const projectFile = path.join(options.projectPath, '.project');
        if (!await fs.pathExists(projectFile)) {
            throw new Error(`Invalid Katalon project: ${options.projectPath}`);
        }

        // Check if test suite exists
        const testSuitePath = path.join(options.projectPath, options.testSuitePath);
        if (!await fs.pathExists(testSuitePath)) {
            throw new Error(`Test suite not found: ${options.testSuitePath}`);
        }

        // Validate browser
        const supportedBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'IE'];
        if (options.browser && !supportedBrowsers.includes(options.browser)) {
            throw new Error(`Unsupported browser: ${options.browser}`);
        }
    }

    private async findKatalonCommand(): Promise<string> {
        // Look for Katalon Runtime Engine in common locations
        const possiblePaths = [
            'C:\\Katalon_Studio_Engine\\katalonc.exe',
            'C:\\Program Files\\Katalon Studio\\katalonc.exe',
            '/Applications/Katalon Studio.app/Contents/MacOS/katalonc',
            '/opt/katalon/katalonc',
            process.env.KATALON_HOME ? path.join(process.env.KATALON_HOME, 'katalonc') : '',
        ].filter(Boolean);

        for (const katalonPath of possiblePaths) {
            if (await fs.pathExists(katalonPath)) {
                return katalonPath;
            }
        }

        // Try to find katalonc in PATH
        return 'katalonc';
    }

    private async buildExecutionArgs(options: ExecutionOptions, executionId: string): Promise<string[]> {
        const args: string[] = [
            '-noSplash',
            '-runMode=console',
            '-projectPath', options.projectPath,
            '-retry', options.retry?.toString() || '0',
            '-statusDelay', '15',
        ];

        // Add test suite
        if (options.testSuitePath.endsWith('.ts')) {
            args.push('-testSuitePath', options.testSuitePath);
        } else if (options.testSuitePath.endsWith('.tsc')) {
            args.push('-testSuiteCollectionPath', options.testSuitePath);
        }

        // Add browser
        if (options.browser) {
            args.push('-browserType', options.browser);
        }

        // Add execution profile
        if (options.executionProfile && options.executionProfile !== 'default') {
            args.push('-executionProfile', options.executionProfile);
        }

        // Add report folder
        const reportFolder = options.reportFolder || path.join(options.projectPath, 'Reports', executionId);
        args.push('-reportFolder', reportFolder);

        // Add browser configuration
        if (options.browserConfig) {
            if (options.browserConfig.headless) {
                args.push('-args', '--headless');
            }
            if (options.browserConfig.windowSize) {
                args.push('-args', `--window-size=${options.browserConfig.windowSize}`);
            }
            if (options.browserConfig.arguments) {
                options.browserConfig.arguments.forEach(arg => {
                    args.push('-args', arg);
                });
            }
        }

        // Add console log
        if (options.consoleLog) {
            args.push('-consoleLog');
        }

        return args;
    }

    private async runKatalonCommand(command: string, args: string[], executionId: string): Promise<{ exitCode: number; output: string }> {
        return new Promise((resolve, reject) => {
            let output = '';
            let errorOutput = '';

            const process = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
            });

            this.runningProcesses.set(executionId, process);

            process.stdout?.on('data', (data) => {
                const chunk = data.toString();
                output += chunk;
                console.log(chunk); // Real-time output
            });

            process.stderr?.on('data', (data) => {
                const chunk = data.toString();
                errorOutput += chunk;
                console.error(chunk); // Real-time error output
            });

            process.on('close', (code) => {
                this.runningProcesses.delete(executionId);
                resolve({
                    exitCode: code || 0,
                    output: output + errorOutput,
                });
            });

            process.on('error', (error) => {
                this.runningProcesses.delete(executionId);
                reject(error);
            });

            // Timeout after 30 minutes
            setTimeout(() => {
                if (this.runningProcesses.has(executionId)) {
                    process.kill();
                    this.runningProcesses.delete(executionId);
                    reject(new Error('Test execution timeout after 30 minutes'));
                }
            }, 30 * 60 * 1000);
        });
    }

    private async parseExecutionResults(projectPath: string, executionId: string): Promise<TestResult[]> {
        try {
            const reportPath = path.join(projectPath, 'Reports', executionId);
            const reportFiles = await fs.readdir(reportPath).catch(() => []);

            const junitFile = reportFiles.find(file => file.endsWith('.xml') && file.includes('JUnit'));
            if (!junitFile) {
                return [];
            }

            const junitPath = path.join(reportPath, junitFile);
            const xmlContent = await fs.readFile(junitPath, 'utf-8');
            const result = await this.parser.parseStringPromise(xmlContent);

            const testResults: TestResult[] = [];
            const testSuites = result.testsuites?.testsuite || [];

            for (const testSuite of Array.isArray(testSuites) ? testSuites : [testSuites]) {
                const testCases = testSuite.testcase || [];

                for (const testCase of Array.isArray(testCases) ? testCases : [testCases]) {
                    testResults.push({
                        testCaseName: testCase.$.name,
                        status: this.getTestStatus(testCase),
                        duration: parseFloat(testCase.$.time) * 1000, // Convert to milliseconds
                        errorMessage: testCase.failure?.[0]?.$.message || testCase.error?.[0]?.$.message,
                    });
                }
            }

            return testResults;
        } catch (error) {
            console.error('Failed to parse execution results:', error);
            return [];
        }
    }

    private getTestStatus(testCase: any): 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR' {
        if (testCase.failure) return 'FAILED';
        if (testCase.error) return 'ERROR';
        if (testCase.skipped) return 'SKIPPED';
        return 'PASSED';
    }

    private async getReportPath(projectPath: string, executionId: string): Promise<string | undefined> {
        const reportPath = path.join(projectPath, 'Reports', executionId);
        return await fs.pathExists(reportPath) ? reportPath : undefined;
    }

    private async getLogPath(projectPath: string, executionId: string): Promise<string | undefined> {
        const logPath = path.join(projectPath, 'Reports', executionId, 'execution.log');
        return await fs.pathExists(logPath) ? logPath : undefined;
    }

    private async getScreenshots(projectPath: string, executionId: string): Promise<string[]> {
        try {
            const reportPath = path.join(projectPath, 'Reports', executionId);
            const files = await fs.readdir(reportPath);
            return files
                .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
                .map(file => path.join(reportPath, file));
        } catch {
            return [];
        }
    }

    private generateExecutionId(): string {
        return `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private formatExecutionResult(result: ExecutionResult): string {
        const summary = `# Katalon Test Execution Report

## Execution Summary
- **Execution ID**: ${result.executionId}
- **Status**: ${result.success ? '✅ PASSED' : '❌ FAILED'}
- **Exit Code**: ${result.exitCode}
- **Start Time**: ${result.startTime.toISOString()}
- **End Time**: ${result.endTime.toISOString()}
- **Duration**: ${(result.duration / 1000).toFixed(2)} seconds

## Test Results Summary
- **Total Tests**: ${result.testResults.length}
- **Passed**: ${result.testResults.filter(t => t.status === 'PASSED').length}
- **Failed**: ${result.testResults.filter(t => t.status === 'FAILED').length}
- **Skipped**: ${result.testResults.filter(t => t.status === 'SKIPPED').length}
- **Errors**: ${result.testResults.filter(t => t.status === 'ERROR').length}

## Individual Test Results
${result.testResults.map(test => `
### ${test.testCaseName}
- **Status**: ${this.getStatusIcon(test.status)} ${test.status}
- **Duration**: ${(test.duration / 1000).toFixed(2)} seconds
${test.errorMessage ? `- **Error**: ${test.errorMessage}` : ''}
`).join('')}

## Artifacts
${result.reportPath ? `- **Report Path**: ${result.reportPath}` : ''}
${result.logPath ? `- **Log Path**: ${result.logPath}` : ''}
${result.screenshots?.length ? `- **Screenshots**: ${result.screenshots.length} files` : ''}
`;

        return summary;
    }

    private getStatusIcon(status: string): string {
        switch (status) {
            case 'PASSED': return '✅';
            case 'FAILED': return '❌';
            case 'SKIPPED': return '⏭️';
            case 'ERROR': return '🚨';
            default: return '❓';
        }
    }

    /**
     * Stop a running test execution
     */
    async stopExecution(executionId: string): Promise<boolean> {
        const process = this.runningProcesses.get(executionId);
        if (process) {
            process.kill();
            this.runningProcesses.delete(executionId);
            return true;
        }
        return false;
    }

    /**
     * Get status of running executions
     */
    getRunningExecutions(): string[] {
        return Array.from(this.runningProcesses.keys());
    }
}
