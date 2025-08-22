#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { KatalonProjectManager } from './katalon/project-manager.js';
import { KatalonTestExecutor } from './katalon/test-executor.js';
import { KatalonObjectRepository } from './katalon/object-repository.js';
import { KatalonKeywordManager } from './katalon/keyword-manager.js';
import { KatalonSmartHealing } from './katalon/smart-healing.js';

/**
 * Katalon MCP Server
 * 
 * This server provides integration between Katalon Studio and Claude AI,
 * enabling intelligent QA automation through the Model Context Protocol.
 */
class KatalonMCPServer {
    private server: Server;
    private projectManager: KatalonProjectManager;
    private testExecutor: KatalonTestExecutor;
    private objectRepository: KatalonObjectRepository;
    private keywordManager: KatalonKeywordManager;
    private smartHealing: KatalonSmartHealing;

    constructor() {
        this.server = new Server(
            {
                name: 'katalon-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    resources: {},
                    tools: {},
                    prompts: {},
                },
            }
        );

        // Initialize Katalon components
        this.projectManager = new KatalonProjectManager();
        this.testExecutor = new KatalonTestExecutor();
        this.objectRepository = new KatalonObjectRepository();
        this.keywordManager = new KatalonKeywordManager();
        this.smartHealing = new KatalonSmartHealing();

        this.setupToolHandlers();
        this.setupResourceHandlers();
        this.setupPromptHandlers();
    }

    private setupToolHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'katalon_execute_test_suite',
                        description: 'Execute a Katalon test suite or test suite collection',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectPath: {
                                    type: 'string',
                                    description: 'Path to the Katalon project',
                                },
                                testSuitePath: {
                                    type: 'string',
                                    description: 'Path to the test suite or test suite collection',
                                },
                                browser: {
                                    type: 'string',
                                    description: 'Browser to execute tests in (Chrome, Firefox, Safari, etc.)',
                                    default: 'Chrome',
                                },
                                executionProfile: {
                                    type: 'string',
                                    description: 'Execution profile to use',
                                    default: 'default',
                                },
                            },
                            required: ['projectPath', 'testSuitePath'],
                        },
                    },
                    {
                        name: 'katalon_create_test_case',
                        description: 'Create a new test case with intelligent object identification',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectPath: {
                                    type: 'string',
                                    description: 'Path to the Katalon project',
                                },
                                testCaseName: {
                                    type: 'string',
                                    description: 'Name of the new test case',
                                },
                                description: {
                                    type: 'string',
                                    description: 'Description of what the test case should do',
                                },
                                targetUrl: {
                                    type: 'string',
                                    description: 'Target URL for web testing (optional)',
                                },
                                testSteps: {
                                    type: 'array',
                                    description: 'Array of test steps with descriptions',
                                    items: {
                                        type: 'string',
                                    },
                                },
                            },
                            required: ['projectPath', 'testCaseName', 'description'],
                        },
                    },
                    {
                        name: 'katalon_manage_object_repository',
                        description: 'Manage object repository with smart healing capabilities',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectPath: {
                                    type: 'string',
                                    description: 'Path to the Katalon project',
                                },
                                action: {
                                    type: 'string',
                                    enum: ['create', 'update', 'delete', 'heal', 'analyze'],
                                    description: 'Action to perform on the object repository',
                                },
                                objectName: {
                                    type: 'string',
                                    description: 'Name of the object',
                                },
                                selector: {
                                    type: 'string',
                                    description: 'Object selector (XPath, CSS, ID, etc.)',
                                },
                                selectorType: {
                                    type: 'string',
                                    enum: ['xpath', 'css', 'id', 'name', 'class', 'tag'],
                                    description: 'Type of selector',
                                },
                            },
                            required: ['projectPath', 'action'],
                        },
                    },
                    {
                        name: 'katalon_manage_keywords',
                        description: 'Manage custom keywords and view built-in keywords',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectPath: {
                                    type: 'string',
                                    description: 'Path to the Katalon project',
                                },
                                action: {
                                    type: 'string',
                                    enum: ['list_builtin', 'list_custom', 'create_custom', 'update_custom'],
                                    description: 'Action to perform',
                                },
                                keywordName: {
                                    type: 'string',
                                    description: 'Name of the custom keyword (for create/update)',
                                },
                                keywordCode: {
                                    type: 'string',
                                    description: 'Groovy code for the custom keyword',
                                },
                            },
                            required: ['projectPath', 'action'],
                        },
                    },
                    {
                        name: 'katalon_analyze_project',
                        description: 'Analyze Katalon project structure and provide insights',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectPath: {
                                    type: 'string',
                                    description: 'Path to the Katalon project',
                                },
                                analysisType: {
                                    type: 'string',
                                    enum: ['overview', 'test_coverage', 'object_health', 'keyword_usage'],
                                    description: 'Type of analysis to perform',
                                },
                            },
                            required: ['projectPath'],
                        },
                    },
                ],
            };
        });

        // Handle tool execution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'katalon_execute_test_suite':
                        return await this.testExecutor.executeTestSuite(args);

                    case 'katalon_create_test_case':
                        return await this.projectManager.createTestCase(args);

                    case 'katalon_manage_object_repository':
                        return await this.objectRepository.manageObjects(args);

                    case 'katalon_manage_keywords':
                        return await this.keywordManager.manageKeywords(args);

                    case 'katalon_analyze_project':
                        return await this.projectManager.analyzeProject(args);

                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            } catch (error) {
                throw new McpError(
                    ErrorCode.InternalError,
                    `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        });
    }

    private setupResourceHandlers(): void {
        // List available resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: [
                    {
                        uri: 'katalon://test-templates',
                        name: 'Katalon Test Case Templates',
                        description: 'Templates for creating various types of test cases',
                        mimeType: 'application/json',
                    },
                    {
                        uri: 'katalon://object-repository-patterns',
                        name: 'Object Repository Best Practices',
                        description: 'Best practices and patterns for object repository management',
                        mimeType: 'text/markdown',
                    },
                    {
                        uri: 'katalon://keyword-library',
                        name: 'Katalon Keyword Library',
                        description: 'Comprehensive library of built-in and custom keywords',
                        mimeType: 'application/json',
                    },
                ],
            };
        });

        // Handle resource reading
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;

            switch (uri) {
                case 'katalon://test-templates':
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(await this.projectManager.getTestTemplates(), null, 2),
                            },
                        ],
                    };

                case 'katalon://object-repository-patterns':
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'text/markdown',
                                text: await this.objectRepository.getBestPracticesGuide(),
                            },
                        ],
                    };

                case 'katalon://keyword-library':
                    return {
                        contents: [
                            {
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(await this.keywordManager.getKeywordLibrary(), null, 2),
                            },
                        ],
                    };

                default:
                    throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
            }
        });
    }

    private setupPromptHandlers(): void {
        // List available prompts
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            return {
                prompts: [
                    {
                        name: 'katalon_test_design',
                        description: 'Guide for designing effective Katalon test cases',
                        arguments: [
                            {
                                name: 'application_type',
                                description: 'Type of application being tested (web, mobile, api)',
                                required: true,
                            },
                            {
                                name: 'test_scope',
                                description: 'Scope of testing (smoke, regression, functional)',
                                required: false,
                            },
                        ],
                    },
                    {
                        name: 'katalon_object_identification',
                        description: 'Best practices for object identification and smart healing',
                        arguments: [
                            {
                                name: 'element_type',
                                description: 'Type of UI element to identify',
                                required: true,
                            },
                        ],
                    },
                ],
            };
        });

        // Handle prompt requests
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case 'katalon_test_design':
                    return {
                        description: 'Guide for designing effective Katalon test cases',
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: await this.generateTestDesignPrompt(args),
                                },
                            },
                        ],
                    };

                case 'katalon_object_identification':
                    return {
                        description: 'Best practices for object identification and smart healing',
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: await this.generateObjectIdentificationPrompt(args),
                                },
                            },
                        ],
                    };

                default:
                    throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${name}`);
            }
        });
    }

    private async generateTestDesignPrompt(args: any): Promise<string> {
        const applicationType = args?.application_type || 'web';
        const testScope = args?.test_scope || 'functional';

        return `# Katalon Test Design Guide

## Application Type: ${applicationType}
## Test Scope: ${testScope}

Based on your application type and test scope, here are the recommended practices for designing effective Katalon test cases:

### Test Structure
- Use Page Object Model pattern for better maintainability
- Implement data-driven testing for comprehensive coverage
- Create reusable custom keywords for common operations

### Object Repository Strategy
- Use smart healing to handle dynamic elements
- Implement multiple locator strategies for robustness
- Group related objects in folders for organization

### Best Practices
- Keep test cases atomic and independent
- Use meaningful names and descriptions
- Implement proper error handling and reporting
- Leverage Katalon's built-in keywords when possible

Would you like specific recommendations for your ${applicationType} application testing strategy?`;
    }

    private async generateObjectIdentificationPrompt(args: any): Promise<string> {
        const elementType = args?.element_type || 'button';

        return `# Katalon Object Identification Best Practices

## Element Type: ${elementType}

### Recommended Locator Strategies for ${elementType}:

1. **Primary Strategy**: Use stable attributes like ID or data-testid
2. **Secondary Strategy**: CSS selectors with meaningful class names
3. **Fallback Strategy**: XPath with relative positioning

### Smart Healing Configuration:
- Enable self-healing for dynamic elements
- Set up alternative locators for backup
- Monitor healing reports for pattern analysis

### Implementation Tips:
- Avoid using auto-generated IDs
- Prefer semantic selectors over positional ones
- Test locators across different browser versions
- Document object repository changes

Would you like help implementing object identification for specific ${elementType} elements in your application?`;
    }

    async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Katalon MCP Server running on stdio');
    }
}

// Start the server
const server = new KatalonMCPServer();
server.run().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
