// Import necessary libraries for running tests and handling files
import * as fs from 'fs-extra'; // File system operations
import * as path from 'path'; // File path manipulation
import { spawn, ChildProcess } from 'child_process'; // Run external programs (Katalon)
import * as xml2js from 'xml2js'; // Parse XML test reports

/**
 * 🎯 ExecutionResult Interface
 * Contains all information about a test run after it completes
 * Like a detailed report card for your test execution
 */
export interface ExecutionResult {
  success: boolean; // Did the test run complete successfully?
  exitCode: number; // System exit code (0 = success, others = error)
  executionId: string; // Unique identifier for this test run
  startTime: Date; // When the test started
  endTime: Date; // When the test finished
  duration: number; // How long it took (in milliseconds)
  testResults: TestResult[]; // Results of individual test cases
  reportPath?: string; // Where the HTML report was saved
  logPath?: string; // Where the log file was saved
  screenshots?: string[]; // Paths to any screenshots taken
}

/**
 * 📝 TestResult Interface
 * Information about a single test case within a test suite
 */
export interface TestResult {
  testCaseName: string; // Name of the test case
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR'; // What happened to this test
  duration: number; // How long this test took
  errorMessage?: string; // Error details if test failed
  screenshots?: string[]; // Screenshots for this specific test
}

/**
 * ⚙️ ExecutionOptions Interface
 * Configuration settings for how to run the tests
 * Like the settings on a washing machine - tells it how to run
 */
export interface ExecutionOptions {
  projectPath: string; // Where your Katalon project is located
  testSuitePath: string; // Which test suite to run
  browser?: string; // Which browser to use (Chrome, Firefox, etc.)
  executionProfile?: string; // Which environment profile (dev, staging, prod)
  browserConfig?: BrowserConfig; // Detailed browser settings
  reportFolder?: string; // Where to save test reports
  consoleLog?: boolean; // Should we show detailed logs in console?
  retry?: number; // How many times to retry failed tests
}

/**
 * 🌐 BrowserConfig Interface
 * Detailed settings for how the browser should behave during testing
 */
interface BrowserConfig {
  browserType: string; // Type of browser (chrome, firefox, edge)
  headless?: boolean; // Run without showing browser window (faster)
  windowSize?: string; // Browser window size (e.g., "1920x1080")
  userAgent?: string; // Pretend to be a different browser/device
  arguments?: string[]; // Special browser startup options
}

/**
 * 🚀 Katalon Test Executor Class
 *
 * This class is responsible for actually running your Katalon tests.
 * Think of it as a remote control for Katalon Studio that can:
 * - Start test executions
 * - Monitor progress in real-time
 * - Collect and parse results
 * - Handle errors and retries
 */
export class KatalonTestExecutor {
  // XML parser for reading Katalon's test result files
  private parser = new xml2js.Parser();

  // Keep track of running test processes so we can manage them
  private runningProcesses: Map<string, ChildProcess> = new Map();

  /**
   * 🎬 Execute Test Suite or Test Suite Collection
   * This is the main method that runs your Katalon tests
   *
   * @param options - Configuration for how to run the tests
   * @returns Promise<ExecutionResult> - Complete results of the test execution
   *
   * Think of this like pressing "play" on a playlist, but for tests.
   * It handles everything from starting the tests to collecting results.
   */
  async executeTestSuite(args: any): Promise<{ content: any[] }> {
    // Convert the arguments passed to this method into proper execution options
    const options: ExecutionOptions = {
      projectPath: args.projectPath, // Where the Katalon project lives
      testSuitePath: args.testSuitePath, // Which test suite to run
      browser: args.browser || 'Chrome', // Default to Chrome if not specified
      executionProfile: args.executionProfile || 'default', // Use default profile
      browserConfig: args.browserConfig, // Browser-specific settings
      reportFolder: args.reportFolder, // Where to save reports
      consoleLog: args.consoleLog !== false, // Show logs unless explicitly disabled
      retry: args.retry || 0, // Don't retry by default
    };

    try {
      // Actually run the test with these options
      const result = await this.executeTest(options);
      return {
        content: [
          {
            type: 'text',
            text: this.formatExecutionResult(result), // Format results for display
          },
        ],
      };
    } catch (error) {
      // If something goes wrong, provide a helpful error message
      throw new Error(
        `Test execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 🔧 Execute Test with Detailed Configuration
   * This is the core method that actually runs Katalon and manages the process
   *
   * @param options - All the settings for how to run the test
   * @returns Promise<ExecutionResult> - Complete results with timing and outcomes
   *
   * This method coordinates all the steps needed to run a test:
   * 1. Validates everything is set up correctly
   * 2. Finds the Katalon program on your computer
   * 3. Builds the command to run
   * 4. Executes the test
   * 5. Collects and processes the results
   */
  private async executeTest(options: ExecutionOptions): Promise<ExecutionResult> {
    // Generate a unique ID for this test run (helps track multiple tests)
    const executionId = this.generateExecutionId();
    const startTime = new Date(); // Record when we started

    // Make sure everything is set up correctly before starting
    await this.validateExecution(options);

    // Find where Katalon is installed on this computer
    const katalonCommand = await this.findKatalonCommand();

    // Build the command-line arguments to pass to Katalon
    const args = await this.buildExecutionArgs(options, executionId);

    // Actually run Katalon with our arguments
    const { exitCode, output } = await this.runKatalonCommand(katalonCommand, args, executionId);

    const endTime = new Date(); // Record when we finished
    const duration = endTime.getTime() - startTime.getTime(); // Calculate how long it took

    // Read and process the test results that Katalon generated
    const testResults = await this.parseExecutionResults(options.projectPath, executionId);

    // Find where Katalon saved the HTML report and log files
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
    if (!(await fs.pathExists(options.projectPath))) {
      throw new Error(`Project path does not exist: ${options.projectPath}`);
    }

    // Check if it's a valid Katalon project
    const projectFile = path.join(options.projectPath, '.project');
    if (!(await fs.pathExists(projectFile))) {
      throw new Error(`Invalid Katalon project: ${options.projectPath}`);
    }

    // Check if test suite exists
    const testSuitePath = path.join(options.projectPath, options.testSuitePath);
    if (!(await fs.pathExists(testSuitePath))) {
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

  private async buildExecutionArgs(
    options: ExecutionOptions,
    executionId: string
  ): Promise<string[]> {
    const args: string[] = [
      '-noSplash',
      '-runMode=console',
      '-projectPath',
      options.projectPath,
      '-retry',
      options.retry?.toString() || '0',
      '-statusDelay',
      '15',
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
    const reportFolder =
      options.reportFolder || path.join(options.projectPath, 'Reports', executionId);
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

  private async runKatalonCommand(
    command: string,
    args: string[],
    executionId: string
  ): Promise<{ exitCode: number; output: string }> {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      this.runningProcesses.set(executionId, process);

      process.stdout?.on('data', data => {
        const chunk = data.toString();
        output += chunk;
        console.log(chunk); // Real-time output
      });

      process.stderr?.on('data', data => {
        const chunk = data.toString();
        errorOutput += chunk;
        console.error(chunk); // Real-time error output
      });

      process.on('close', code => {
        this.runningProcesses.delete(executionId);
        resolve({
          exitCode: code || 0,
          output: output + errorOutput,
        });
      });

      process.on('error', error => {
        this.runningProcesses.delete(executionId);
        reject(error);
      });

      // Timeout after 30 minutes
      setTimeout(
        () => {
          if (this.runningProcesses.has(executionId)) {
            process.kill();
            this.runningProcesses.delete(executionId);
            reject(new Error('Test execution timeout after 30 minutes'));
          }
        },
        30 * 60 * 1000
      );
    });
  }

  private async parseExecutionResults(
    projectPath: string,
    executionId: string
  ): Promise<TestResult[]> {
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

  private async getReportPath(
    projectPath: string,
    executionId: string
  ): Promise<string | undefined> {
    const reportPath = path.join(projectPath, 'Reports', executionId);
    return (await fs.pathExists(reportPath)) ? reportPath : undefined;
  }

  private async getLogPath(projectPath: string, executionId: string): Promise<string | undefined> {
    const logPath = path.join(projectPath, 'Reports', executionId, 'execution.log');
    return (await fs.pathExists(logPath)) ? logPath : undefined;
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
${result.testResults
  .map(
    test => `
### ${test.testCaseName}
- **Status**: ${this.getStatusIcon(test.status)} ${test.status}
- **Duration**: ${(test.duration / 1000).toFixed(2)} seconds
${test.errorMessage ? `- **Error**: ${test.errorMessage}` : ''}
`
  )
  .join('')}

## Artifacts
${result.reportPath ? `- **Report Path**: ${result.reportPath}` : ''}
${result.logPath ? `- **Log Path**: ${result.logPath}` : ''}
${result.screenshots?.length ? `- **Screenshots**: ${result.screenshots.length} files` : ''}
`;

    return summary;
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'PASSED':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'SKIPPED':
        return '⏭️';
      case 'ERROR':
        return '🚨';
      default:
        return '❓';
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
