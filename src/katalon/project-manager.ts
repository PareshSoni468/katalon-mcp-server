// Import necessary libraries for file operations and XML parsing
import * as fs from 'fs-extra'; // Enhanced file system operations
import * as path from 'path'; // File path manipulation
import * as xml2js from 'xml2js'; // Convert XML files to JavaScript objects
import { glob } from 'glob'; // Find files using patterns (like *.tc, *.ts)

/**
 * 📁 KatalonProject Interface
 * Defines what information we store about a Katalon project
 * Think of this as a "business card" for each project
 */
export interface KatalonProject {
  name: string; // Project name (e.g., "E-commerce Tests")
  path: string; // Where the project is stored on disk
  version: string; // Katalon version used
  testCases: string[]; // List of all test case files
  testSuites: string[]; // List of all test suite files
  objectRepositories: string[]; // List of UI element definition files
  profiles: string[]; // List of execution profiles (dev, staging, prod)
}

/**
 * 📋 TestCaseTemplate Interface
 * Defines pre-built templates for creating common types of tests
 * Like having a recipe book for different kinds of test cases
 */
export interface TestCaseTemplate {
  name: string; // Template name (e.g., "Login Test")
  description: string; // What this template does
  category: string; // Type of test (UI, API, Mobile, etc.)
  template: string; // The actual code template
  keywords: string[]; // Katalon keywords used in this template
}

/**
 * 📊 AnalysisResult Interface
 * Contains all the health and status information about a project
 * Like a medical checkup report for your test project
 */
export interface AnalysisResult {
  overview: ProjectOverview; // Basic project statistics
  testCoverage?: TestCoverage; // How well tests cover the application
  objectHealth?: ObjectHealth; // Status of UI elements
  keywordUsage?: KeywordUsage; // Which keywords are being used
}

/**
 * 📈 ProjectOverview Interface
 * Basic statistics about the project - the "at a glance" view
 */
interface ProjectOverview {
  totalTestCases: number; // How many test cases exist
  totalTestSuites: number; // How many test suites exist
  totalObjects: number; // How many UI elements are defined
  totalKeywords: number; // How many custom keywords exist
  lastModified: Date; // When was the project last changed
}

/**
 * 🎯 TestCoverage Interface
 * Information about how well your tests are performing
 */
interface TestCoverage {
  executedTests: number; // How many tests have been run
  passedTests: number; // How many tests succeeded
  failedTests: number; // How many tests failed
  coverage: number; // Percentage of application covered by tests
}

/**
 * 🏥 ObjectHealth Interface
 * Status of UI elements (buttons, text fields, etc.) in your tests
 */
interface ObjectHealth {
  totalObjects: number; // Total number of UI elements defined
  healthyObjects: number; // Elements that work correctly
  brokenObjects: number; // Elements that need fixing
  healedObjects: number; // Elements that were auto-fixed
}

interface KeywordUsage {
  builtInKeywords: number;
  customKeywords: number;
  mostUsedKeywords: string[];
}

/**
 * Katalon Project Manager
 * Handles project analysis, test case creation, and project structure management
 */
export class KatalonProjectManager {
  private parser = new xml2js.Parser();
  private builder = new xml2js.Builder();

  /**
   * Analyze a Katalon project and return insights
   */
  async analyzeProject(args: any): Promise<{ content: any[] }> {
    const { projectPath, analysisType = 'overview' } = args;

    if (!(await this.isKatalonProject(projectPath))) {
      throw new Error('Invalid Katalon project path');
    }

    const analysis: AnalysisResult = {
      overview: await this.getProjectOverview(projectPath),
    };

    switch (analysisType) {
      case 'test_coverage':
        analysis.testCoverage = await this.getTestCoverage(projectPath);
        break;
      case 'object_health':
        analysis.objectHealth = await this.getObjectHealth(projectPath);
        break;
      case 'keyword_usage':
        analysis.keywordUsage = await this.getKeywordUsage(projectPath);
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: `# Katalon Project Analysis\n\n${JSON.stringify(analysis, null, 2)}`,
        },
      ],
    };
  }

  /**
   * Create a new test case with intelligent suggestions
   */
  async createTestCase(args: any): Promise<{ content: any[] }> {
    const { projectPath, testCaseName, description, targetUrl, testSteps = [] } = args;

    if (!(await this.isKatalonProject(projectPath))) {
      throw new Error('Invalid Katalon project path');
    }

    const testCaseContent = await this.generateTestCaseContent({
      name: testCaseName,
      description,
      targetUrl,
      steps: testSteps,
    });

    const testCasePath = path.join(
      projectPath,
      'Test Cases',
      `${testCaseName.replace(/[^a-zA-Z0-9]/g, '_')}.tc`
    );

    await fs.ensureDir(path.dirname(testCasePath));
    await fs.writeFile(testCasePath, testCaseContent);

    return {
      content: [
        {
          type: 'text',
          text: `Test case "${testCaseName}" created successfully at: ${testCasePath}\n\nGenerated content:\n\`\`\`xml\n${testCaseContent}\n\`\`\``,
        },
      ],
    };
  }

  /**
   * Get test case templates for different scenarios
   */
  async getTestTemplates(): Promise<TestCaseTemplate[]> {
    return [
      {
        name: 'Web Login Test',
        description: 'Template for testing user login functionality',
        category: 'Authentication',
        template: this.getLoginTestTemplate(),
        keywords: [
          'WebUI.openBrowser',
          'WebUI.setText',
          'WebUI.click',
          'WebUI.verifyElementPresent',
        ],
      },
      {
        name: 'API Test',
        description: 'Template for REST API testing',
        category: 'API',
        template: this.getApiTestTemplate(),
        keywords: ['WS.sendRequest', 'WS.verifyResponseStatusCode', 'WS.getElementText'],
      },
      {
        name: 'Data-Driven Test',
        description: 'Template for data-driven testing with Excel/CSV',
        category: 'Data-Driven',
        template: this.getDataDrivenTestTemplate(),
        keywords: ['findTestData', 'for loop', 'WebUI.setText'],
      },
      {
        name: 'Mobile Test',
        description: 'Template for mobile application testing',
        category: 'Mobile',
        template: this.getMobileTestTemplate(),
        keywords: ['Mobile.startApplication', 'Mobile.tap', 'Mobile.verifyElementExist'],
      },
    ];
  }

  private async isKatalonProject(projectPath: string): Promise<boolean> {
    try {
      const katalonProjectFile = path.join(projectPath, '.project');
      const settingsFolder = path.join(projectPath, 'settings');

      return (await fs.pathExists(katalonProjectFile)) && (await fs.pathExists(settingsFolder));
    } catch {
      return false;
    }
  }

  private async getProjectOverview(projectPath: string): Promise<ProjectOverview> {
    const testCasesPath = path.join(projectPath, 'Test Cases');
    const testSuitesPath = path.join(projectPath, 'Test Suites');
    const objectRepoPath = path.join(projectPath, 'Object Repository');
    const keywordsPath = path.join(projectPath, 'Keywords');

    const [testCases, testSuites, objects, keywords] = await Promise.all([
      this.countFiles(testCasesPath, '**/*.tc'),
      this.countFiles(testSuitesPath, '**/*.ts'),
      this.countFiles(objectRepoPath, '**/*.rs'),
      this.countFiles(keywordsPath, '**/*.groovy'),
    ]);

    return {
      totalTestCases: testCases,
      totalTestSuites: testSuites,
      totalObjects: objects,
      totalKeywords: keywords,
      lastModified: new Date(),
    };
  }

  private async getTestCoverage(projectPath: string): Promise<TestCoverage> {
    // This would integrate with Katalon's reporting system
    // For now, return mock data
    return {
      executedTests: 85,
      passedTests: 78,
      failedTests: 7,
      coverage: 91.8,
    };
  }

  private async getObjectHealth(projectPath: string): Promise<ObjectHealth> {
    const objectRepoPath = path.join(projectPath, 'Object Repository');
    const totalObjects = await this.countFiles(objectRepoPath, '**/*.rs');

    // This would analyze object repository files for health status
    return {
      totalObjects,
      healthyObjects: Math.floor(totalObjects * 0.85),
      brokenObjects: Math.floor(totalObjects * 0.1),
      healedObjects: Math.floor(totalObjects * 0.05),
    };
  }

  private async getKeywordUsage(projectPath: string): Promise<KeywordUsage> {
    const keywordsPath = path.join(projectPath, 'Keywords');
    const customKeywords = await this.countFiles(keywordsPath, '**/*.groovy');

    return {
      builtInKeywords: 150, // Katalon has around 150+ built-in keywords
      customKeywords,
      mostUsedKeywords: [
        'WebUI.openBrowser',
        'WebUI.navigateToUrl',
        'WebUI.setText',
        'WebUI.click',
        'WebUI.verifyElementPresent',
      ],
    };
  }

  private async countFiles(dirPath: string, pattern: string): Promise<number> {
    try {
      if (!(await fs.pathExists(dirPath))) return 0;
      const files = await glob(pattern, { cwd: dirPath });
      return files.length;
    } catch {
      return 0;
    }
  }

  private async generateTestCaseContent(testCase: {
    name: string;
    description: string;
    targetUrl?: string;
    steps: string[];
  }): Promise<string> {
    const testCaseXml = {
      TestCaseEntity: {
        $: {
          xmlns: 'http://www.kms-technology.com/testcase',
        },
        description: testCase.description,
        name: testCase.name,
        tag: '',
        comment: '',
        testCaseGuid: this.generateGuid(),
        variableLinks: '',
        variable: '',
        defaultProfile: 'default',
        TestStep: testCase.steps.map((step, index) => ({
          $: { runmode: 'true' },
          TestStepEntity: {
            $: { id: (index + 1).toString() },
            description: step,
            name: `Step ${index + 1}`,
            runmode: 'true',
            CommandEntity: {
              CommandName: 'comment',
              CommandParameters: {
                CommandParameter: {
                  $: { expression: step },
                },
              },
            },
          },
        })),
      },
    };

    return this.builder.buildObject(testCaseXml);
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private getLoginTestTemplate(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<TestCaseEntity>
   <description>Login test case template</description>
   <name>Login_Test_Template</name>
   <comment></comment>
   <testCaseGuid>00000000-0000-0000-0000-000000000000</testCaseGuid>
   <TestStep>
      <TestStepEntity>
         <description>Open browser and navigate to login page</description>
         <name>Open Login Page</name>
         <CommandEntity>
            <CommandName>WebUI.openBrowser</CommandName>
            <CommandParameters>
               <CommandParameter expression="''" />
            </CommandParameters>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
   <TestStep>
      <TestStepEntity>
         <description>Enter username</description>
         <name>Enter Username</name>
         <CommandEntity>
            <CommandName>WebUI.setText</CommandName>
            <CommandParameters>
               <CommandParameter expression="findTestObject('Page_Login/input_username')" />
               <CommandParameter expression="username" />
            </CommandParameters>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
   <TestStep>
      <TestStepEntity>
         <description>Enter password</description>
         <name>Enter Password</name>
         <CommandEntity>
            <CommandName>WebUI.setText</CommandName>
            <CommandParameters>
               <CommandParameter expression="findTestObject('Page_Login/input_password')" />
               <CommandParameter expression="password" />
            </CommandParameters>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
   <TestStep>
      <TestStepEntity>
         <description>Click login button</description>
         <name>Click Login</name>
         <CommandEntity>
            <CommandName>WebUI.click</CommandName>
            <CommandParameters>
               <CommandParameter expression="findTestObject('Page_Login/btn_login')" />
            </CommandParameters>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
</TestCaseEntity>`;
  }

  private getApiTestTemplate(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<TestCaseEntity>
   <description>API test case template</description>
   <name>API_Test_Template</name>
   <comment></comment>
   <testCaseGuid>00000000-0000-0000-0000-000000000000</testCaseGuid>
   <TestStep>
      <TestStepEntity>
         <description>Send API request</description>
         <name>Send Request</name>
         <CommandEntity>
            <CommandName>WS.sendRequest</CommandName>
            <CommandParameters>
               <CommandParameter expression="findTestObject('API/GET_Request')" />
            </CommandParameters>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
   <TestStep>
      <TestStepEntity>
         <description>Verify response status</description>
         <name>Verify Status Code</name>
         <CommandEntity>
            <CommandName>WS.verifyResponseStatusCode</CommandName>
            <CommandParameters>
               <CommandParameter expression="response" />
               <CommandParameter expression="200" />
            </CommandParameters>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
</TestCaseEntity>`;
  }

  private getDataDrivenTestTemplate(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<TestCaseEntity>
   <description>Data-driven test case template</description>
   <name>DataDriven_Test_Template</name>
   <comment></comment>
   <testCaseGuid>00000000-0000-0000-0000-000000000000</testCaseGuid>
   <TestStep>
      <TestStepEntity>
         <description>Load test data</description>
         <name>Load Data</name>
         <CommandEntity>
            <CommandName>findTestData</CommandName>
            <CommandParameters>
               <CommandParameter expression="'Data Files/TestData'" />
            </CommandParameters>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
   <TestStep>
      <TestStepEntity>
         <description>Iterate through data rows</description>
         <name>Data Loop</name>
         <CommandEntity>
            <CommandName>for (def row in data)</CommandName>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
</TestCaseEntity>`;
  }

  private getMobileTestTemplate(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<TestCaseEntity>
   <description>Mobile test case template</description>
   <name>Mobile_Test_Template</name>
   <comment></comment>
   <testCaseGuid>00000000-0000-0000-0000-000000000000</testCaseGuid>
   <TestStep>
      <TestStepEntity>
         <description>Start mobile application</description>
         <name>Start App</name>
         <CommandEntity>
            <CommandName>Mobile.startApplication</CommandName>
            <CommandParameters>
               <CommandParameter expression="'path/to/app.apk'" />
               <CommandParameter expression="false" />
            </CommandParameters>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
   <TestStep>
      <TestStepEntity>
         <description>Tap on element</description>
         <name>Tap Element</name>
         <CommandEntity>
            <CommandName>Mobile.tap</CommandName>
            <CommandParameters>
               <CommandParameter expression="findTestObject('Mobile/btn_login')" />
               <CommandParameter expression="10" />
            </CommandParameters>
         </CommandEntity>
      </TestStepEntity>
   </TestStep>
</TestCaseEntity>`;
  }
}
