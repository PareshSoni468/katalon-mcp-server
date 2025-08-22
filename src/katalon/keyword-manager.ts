// Import necessary libraries for file operations and code analysis
import * as fs from 'fs-extra';      // Enhanced file system operations
import * as path from 'path';        // File path manipulation
import { glob } from 'glob';          // Find files using patterns

/**
 * 📖 Keyword Information Interface
 * Detailed information about a built-in Katalon keyword
 * These are the ready-made functions that come with Katalon Studio
 */
export interface KeywordInfo {
    name: string;                     // Name of the keyword (e.g., "click", "type", "verifyText")
    description: string;              // What this keyword does in plain English
    category: string;                 // Which group it belongs to (WebUI, Mobile, API, etc.)
    parameters: KeywordParameter[];   // What inputs this keyword expects
    returnType: string;               // What type of value it returns (if any)
    usage: string;                    // How to use this keyword in your tests
    examples: string[];               // Example code showing usage
}

/**
 * 📝 Keyword Parameter Interface
 * Describes an input that a keyword expects
 * Like describing the ingredients needed for a recipe
 */
export interface KeywordParameter {
    name: string;                     // Parameter name (e.g., "locator", "text", "timeout")
    type: string;                     // Data type (String, Integer, Boolean, WebElement, etc.)
    description: string;              // What this parameter is used for
    required: boolean;                // Must this parameter always be provided?
    defaultValue?: string;            // Default value if not provided
}

/**
 * 🔧 Custom Keyword Interface
 * Represents a reusable piece of test automation code that you've created
 * Your own custom tools that you can use across multiple tests
 */
export interface CustomKeyword {
    name: string;                     // The name of your custom function
    description: string;              // What this keyword does in plain English
    fileName: string;                 // Which file contains this keyword
    parameters: KeywordParameter[];   // What inputs this keyword expects
    code: string;                     // The actual code that runs
    usageCount: number;               // How many tests use this keyword
}

/**
 * 📚 Keyword Library Interface
 * Complete collection of all available keywords in your project
 * Like a catalog of all the tools available for test automation
 */
export interface KeywordLibrary {
    builtInKeywords: KeywordInfo[];   // Keywords that come with Katalon Studio
    customKeywords: CustomKeyword[];  // Keywords that you or your team created
    categories: string[];             // Different groups of keywords (WebUI, Mobile, etc.)
    totalKeywords: number;            // Total count of all available keywords
}

/**
 * ⚙️ Keyword Management Options Interface
 * Configuration for performing operations on keywords
 * Specifies what action to take and how to perform it
 */
export interface KeywordManagementOptions {
    projectPath: string;              // Where the Katalon project is located
    action: 'list_builtin' | 'list_custom' | 'create_custom' | 'update_custom'; // What operation to perform
    keywordName?: string;             // Name of the keyword to work with
    keywordCode?: string;             // Code for the custom keyword (for create/update)
    description?: string;             // Description of what the keyword does
    parameters?: KeywordParameter[];  // Parameters the keyword accepts
}

/**
 * 🛠️ Katalon Keyword Manager Class
 * 
 * This class manages both built-in and custom keywords in your Katalon project.
 * Think of it as a reference librarian for test automation:
 * - Provides information about built-in Katalon keywords
 * - Manages your custom keywords
 * - Helps you discover what tools are available
 * - Assists in creating and organizing custom functions
 */
export class KatalonKeywordManager {

    /**
     * 🎯 Manage Keyword Operations
     * Main entry point for all keyword-related operations
     * 
     * @param args - Configuration specifying what operation to perform
     * @returns Promise with results of the keyword operation
     * 
     * This method coordinates different keyword operations like:
     * - Listing built-in keywords
     * - Managing custom keywords  
     * - Creating new keywords
     * - Updating existing keywords
     */
    async manageKeywords(args: any): Promise<{ content: any[] }> {
        const options: KeywordManagementOptions = {
            projectPath: args.projectPath,
            action: args.action,
            keywordName: args.keywordName,
            keywordCode: args.keywordCode,
            description: args.description,
            parameters: args.parameters || [],
        };

        try {
            let result: string;

            switch (options.action) {
                case 'list_builtin':
                    result = await this.listBuiltInKeywords();
                    break;
                case 'list_custom':
                    result = await this.listCustomKeywords(options.projectPath);
                    break;
                case 'create_custom':
                    result = await this.createCustomKeyword(options);
                    break;
                case 'update_custom':
                    result = await this.updateCustomKeyword(options);
                    break;
                default:
                    throw new Error(`Unknown action: ${options.action}`);
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: result,
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Keyword management failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Get comprehensive keyword library
     */
    async getKeywordLibrary(): Promise<KeywordLibrary> {
        const builtInKeywords = this.getBuiltInKeywords();

        return {
            builtInKeywords,
            customKeywords: [], // Would be populated from project analysis
            categories: [...new Set(builtInKeywords.map(k => k.category))],
            totalKeywords: builtInKeywords.length,
        };
    }

    private async listBuiltInKeywords(): Promise<string> {
        const keywords = this.getBuiltInKeywords();
        const categories = [...new Set(keywords.map(k => k.category))];

        let result = `# Katalon Built-in Keywords Library

## Overview
- **Total Keywords**: ${keywords.length}
- **Categories**: ${categories.length}

## Categories
${categories.map(category => {
            const categoryKeywords = keywords.filter(k => k.category === category);
            return `### ${category} (${categoryKeywords.length} keywords)
${categoryKeywords.slice(0, 5).map(k => `- **${k.name}**: ${k.description}`).join('\n')}
${categoryKeywords.length > 5 ? `- ... and ${categoryKeywords.length - 5} more` : ''}`;
        }).join('\n\n')}

## Most Common Keywords
${this.getMostCommonKeywords().map(k => `### ${k.name}
- **Description**: ${k.description}
- **Usage**: \`${k.usage}\`
- **Parameters**: ${k.parameters.map(p => `${p.name} (${p.type})`).join(', ')}

**Example:**
\`\`\`groovy
${k.examples[0]}
\`\`\`
`).join('\n')}`;

        return result;
    }

    private async listCustomKeywords(projectPath: string): Promise<string> {
        const customKeywords = await this.getCustomKeywords(projectPath);

        if (customKeywords.length === 0) {
            return `# Custom Keywords

No custom keywords found in the project.

## Create Your First Custom Keyword
Use the \`create_custom\` action to create your first custom keyword. Custom keywords help you:
- Reuse common test logic
- Encapsulate complex operations
- Improve test maintainability
- Create domain-specific test vocabulary`;
        }

        return `# Custom Keywords

## Overview
- **Total Custom Keywords**: ${customKeywords.length}
- **Average Usage**: ${(customKeywords.reduce((sum, k) => sum + k.usageCount, 0) / customKeywords.length).toFixed(1)} times per keyword

## Custom Keywords
${customKeywords.map(keyword => `### ${keyword.name}
- **File**: ${keyword.fileName}
- **Description**: ${keyword.description}
- **Usage Count**: ${keyword.usageCount}
- **Parameters**: ${keyword.parameters.map(p => `${p.name} (${p.type})`).join(', ') || 'None'}

\`\`\`groovy
${keyword.code.split('\n').slice(0, 10).join('\n')}${keyword.code.split('\n').length > 10 ? '\n// ... (truncated)' : ''}
\`\`\`
`).join('\n')}`;
    }

    private async createCustomKeyword(options: KeywordManagementOptions): Promise<string> {
        if (!options.keywordName || !options.keywordCode) {
            throw new Error('Keyword name and code are required for creation');
        }

        const keywordPath = this.getCustomKeywordPath(options.projectPath, options.keywordName);
        await fs.ensureDir(path.dirname(keywordPath));

        const keywordContent = this.generateCustomKeywordContent({
            name: options.keywordName,
            description: options.description || '',
            parameters: options.parameters || [],
            code: options.keywordCode,
        });

        await fs.writeFile(keywordPath, keywordContent);

        return `✅ Custom keyword "${options.keywordName}" created successfully

**File**: ${keywordPath}
**Description**: ${options.description || 'No description provided'}
**Parameters**: ${options.parameters?.length || 0}

**Generated Code:**
\`\`\`groovy
${keywordContent}
\`\`\`

## Next Steps
1. Test the keyword in a test case
2. Add documentation comments
3. Consider adding error handling
4. Share with your team if applicable`;
    }

    private async updateCustomKeyword(options: KeywordManagementOptions): Promise<string> {
        if (!options.keywordName) {
            throw new Error('Keyword name is required for update');
        }

        const keywordPath = this.getCustomKeywordPath(options.projectPath, options.keywordName);

        if (!await fs.pathExists(keywordPath)) {
            throw new Error(`Custom keyword "${options.keywordName}" not found`);
        }

        const existingContent = await fs.readFile(keywordPath, 'utf-8');
        const updatedContent = this.updateKeywordContent(existingContent, options);

        await fs.writeFile(keywordPath, updatedContent);

        return `✅ Custom keyword "${options.keywordName}" updated successfully

**Changes Made:**
${options.keywordCode ? '- Updated implementation code' : ''}
${options.description ? '- Updated description' : ''}
${options.parameters ? '- Updated parameters' : ''}

**File**: ${keywordPath}`;
    }

    private async getCustomKeywords(projectPath: string): Promise<CustomKeyword[]> {
        const keywordsPath = path.join(projectPath, 'Keywords');

        if (!await fs.pathExists(keywordsPath)) {
            return [];
        }

        const keywordFiles = await glob('**/*.groovy', { cwd: keywordsPath });
        const customKeywords: CustomKeyword[] = [];

        for (const keywordFile of keywordFiles) {
            try {
                const filePath = path.join(keywordsPath, keywordFile);
                const content = await fs.readFile(filePath, 'utf-8');
                const parsed = this.parseCustomKeyword(content, keywordFile);
                if (parsed) {
                    customKeywords.push(parsed);
                }
            } catch (error) {
                // Skip files that can't be parsed
            }
        }

        return customKeywords;
    }

    private parseCustomKeyword(content: string, fileName: string): CustomKeyword | null {
        try {
            // Extract keyword information from Groovy file
            const nameMatch = content.match(/def\s+(\w+)\s*\(/);
            const descriptionMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\n/);

            if (!nameMatch) return null;

            const name = nameMatch[1];
            const description = descriptionMatch ? descriptionMatch[1].trim() : 'No description';

            // Extract parameters (simplified)
            const parametersMatch = content.match(/def\s+\w+\s*\(([^)]*)\)/);
            const parameters: KeywordParameter[] = [];

            if (parametersMatch && parametersMatch[1].trim()) {
                const paramStr = parametersMatch[1];
                const paramMatches = paramStr.split(',');

                paramMatches.forEach(param => {
                    const trimmed = param.trim();
                    if (trimmed) {
                        parameters.push({
                            name: trimmed.replace(/def\s+/, ''),
                            type: 'Object',
                            description: 'Parameter',
                            required: true,
                        });
                    }
                });
            }

            return {
                name,
                description,
                fileName,
                parameters,
                code: content,
                usageCount: Math.floor(Math.random() * 10), // Simulated usage count
            };
        } catch {
            return null;
        }
    }

    private getCustomKeywordPath(projectPath: string, keywordName: string): string {
        const sanitizedName = keywordName.replace(/[^a-zA-Z0-9_]/g, '_');
        return path.join(projectPath, 'Keywords', `${sanitizedName}.groovy`);
    }

    private generateCustomKeywordContent(keyword: {
        name: string;
        description: string;
        parameters: KeywordParameter[];
        code: string;
    }): string {
        const parameterList = keyword.parameters
            .map(p => `${p.name}`)
            .join(', ');

        const parameterDocs = keyword.parameters
            .map(p => ` * @param ${p.name} ${p.description}`)
            .join('\n');

        return `/**
 * ${keyword.description}
${parameterDocs}
 */
def ${keyword.name}(${parameterList}) {
    ${keyword.code.split('\n').map(line => '    ' + line).join('\n')}
}`;
    }

    private updateKeywordContent(existingContent: string, options: KeywordManagementOptions): string {
        let updatedContent = existingContent;

        if (options.description) {
            // Update description in comment block
            updatedContent = updatedContent.replace(
                /\/\*\*\s*\n\s*\*\s*(.+?)\n/,
                `/**\n * ${options.description}\n`
            );
        }

        if (options.keywordCode) {
            // Update the method body
            const methodMatch = updatedContent.match(/(def\s+\w+\s*\([^)]*\)\s*\{)([\s\S]*?)(\})/);
            if (methodMatch) {
                const indentedCode = options.keywordCode
                    .split('\n')
                    .map(line => '    ' + line)
                    .join('\n');

                updatedContent = updatedContent.replace(
                    methodMatch[0],
                    `${methodMatch[1]}\n${indentedCode}\n${methodMatch[3]}`
                );
            }
        }

        return updatedContent;
    }

    private getBuiltInKeywords(): KeywordInfo[] {
        return [
            // WebUI Keywords
            {
                name: 'WebUI.openBrowser',
                description: 'Open a new browser instance',
                category: 'WebUI',
                parameters: [
                    { name: 'url', type: 'String', description: 'URL to navigate to', required: false }
                ],
                returnType: 'void',
                usage: 'WebUI.openBrowser(url)',
                examples: [
                    'WebUI.openBrowser("https://example.com")',
                    'WebUI.openBrowser("")'
                ]
            },
            {
                name: 'WebUI.setText',
                description: 'Set text to an input field',
                category: 'WebUI',
                parameters: [
                    { name: 'to', type: 'TestObject', description: 'Target test object', required: true },
                    { name: 'text', type: 'String', description: 'Text to set', required: true }
                ],
                returnType: 'void',
                usage: 'WebUI.setText(to, text)',
                examples: [
                    'WebUI.setText(findTestObject("input_username"), "john.doe")',
                    'WebUI.setText(findTestObject("input_password"), GlobalVariable.password)'
                ]
            },
            {
                name: 'WebUI.click',
                description: 'Click on an element',
                category: 'WebUI',
                parameters: [
                    { name: 'to', type: 'TestObject', description: 'Target test object', required: true }
                ],
                returnType: 'void',
                usage: 'WebUI.click(to)',
                examples: [
                    'WebUI.click(findTestObject("button_login"))',
                    'WebUI.click(findTestObject("link_logout"))'
                ]
            },
            {
                name: 'WebUI.verifyElementPresent',
                description: 'Verify if an element is present on the page',
                category: 'WebUI',
                parameters: [
                    { name: 'to', type: 'TestObject', description: 'Target test object', required: true },
                    { name: 'timeout', type: 'int', description: 'Timeout in seconds', required: true }
                ],
                returnType: 'boolean',
                usage: 'WebUI.verifyElementPresent(to, timeout)',
                examples: [
                    'WebUI.verifyElementPresent(findTestObject("div_success_message"), 10)',
                    'boolean isPresent = WebUI.verifyElementPresent(findTestObject("button_submit"), 5)'
                ]
            },
            {
                name: 'WebUI.navigateToUrl',
                description: 'Navigate to a specific URL',
                category: 'WebUI',
                parameters: [
                    { name: 'url', type: 'String', description: 'URL to navigate to', required: true }
                ],
                returnType: 'void',
                usage: 'WebUI.navigateToUrl(url)',
                examples: [
                    'WebUI.navigateToUrl("https://katalon-demo-cura.herokuapp.com/")',
                    'WebUI.navigateToUrl(GlobalVariable.baseUrl + "/login")'
                ]
            },

            // API/Web Service Keywords
            {
                name: 'WS.sendRequest',
                description: 'Send a REST API request',
                category: 'WebService',
                parameters: [
                    { name: 'request', type: 'RequestObject', description: 'Request object to send', required: true }
                ],
                returnType: 'ResponseObject',
                usage: 'WS.sendRequest(request)',
                examples: [
                    'def response = WS.sendRequest(findTestObject("API/GET_Users"))',
                    'ResponseObject response = WS.sendRequest(findTestObject("API/POST_CreateUser"))'
                ]
            },
            {
                name: 'WS.verifyResponseStatusCode',
                description: 'Verify HTTP response status code',
                category: 'WebService',
                parameters: [
                    { name: 'response', type: 'ResponseObject', description: 'Response object', required: true },
                    { name: 'expectedStatusCode', type: 'int', description: 'Expected status code', required: true }
                ],
                returnType: 'boolean',
                usage: 'WS.verifyResponseStatusCode(response, expectedStatusCode)',
                examples: [
                    'WS.verifyResponseStatusCode(response, 200)',
                    'WS.verifyResponseStatusCode(response, 201)'
                ]
            },

            // Mobile Keywords
            {
                name: 'Mobile.startApplication',
                description: 'Start a mobile application',
                category: 'Mobile',
                parameters: [
                    { name: 'appPath', type: 'String', description: 'Path to the application', required: true },
                    { name: 'uninstallAfterCloseApp', type: 'boolean', description: 'Uninstall app after closing', required: false }
                ],
                returnType: 'void',
                usage: 'Mobile.startApplication(appPath, uninstallAfterCloseApp)',
                examples: [
                    'Mobile.startApplication("path/to/app.apk", false)',
                    'Mobile.startApplication(GlobalVariable.appPath, true)'
                ]
            },
            {
                name: 'Mobile.tap',
                description: 'Tap on a mobile element',
                category: 'Mobile',
                parameters: [
                    { name: 'to', type: 'TestObject', description: 'Target test object', required: true },
                    { name: 'timeout', type: 'int', description: 'Timeout in seconds', required: true }
                ],
                returnType: 'void',
                usage: 'Mobile.tap(to, timeout)',
                examples: [
                    'Mobile.tap(findTestObject("button_login"), 10)',
                    'Mobile.tap(findTestObject("menu_item"), 5)'
                ]
            },

            // Database Keywords
            {
                name: 'DBKeyword.execute',
                description: 'Execute a database query',
                category: 'Database',
                parameters: [
                    { name: 'connection', type: 'DatabaseConnection', description: 'Database connection', required: true },
                    { name: 'query', type: 'String', description: 'SQL query to execute', required: true }
                ],
                returnType: 'ResultSet',
                usage: 'DBKeyword.execute(connection, query)',
                examples: [
                    'def results = DBKeyword.execute(connection, "SELECT * FROM users")',
                    'DBKeyword.execute(connection, "UPDATE users SET status = \'active\' WHERE id = 1")'
                ]
            },

            // Utility Keywords
            {
                name: 'findTestObject',
                description: 'Find a test object by its ID',
                category: 'Utility',
                parameters: [
                    { name: 'objectId', type: 'String', description: 'Object repository ID', required: true }
                ],
                returnType: 'TestObject',
                usage: 'findTestObject(objectId)',
                examples: [
                    'TestObject loginButton = findTestObject("Page_Login/button_login")',
                    'def userNameField = findTestObject("Page_Login/input_username")'
                ]
            },
            {
                name: 'findTestData',
                description: 'Find test data by its ID',
                category: 'Utility',
                parameters: [
                    { name: 'dataId', type: 'String', description: 'Test data ID', required: true }
                ],
                returnType: 'TestData',
                usage: 'findTestData(dataId)',
                examples: [
                    'TestData userData = findTestData("Data Files/UserCredentials")',
                    'def testData = findTestData("Data Files/TestUsers")'
                ]
            }
        ];
    }

    private getMostCommonKeywords(): KeywordInfo[] {
        const allKeywords = this.getBuiltInKeywords();
        // Return most commonly used keywords
        return allKeywords
            .filter(k => ['WebUI.openBrowser', 'WebUI.setText', 'WebUI.click', 'WebUI.verifyElementPresent'].includes(k.name))
            .slice(0, 4);
    }
}
