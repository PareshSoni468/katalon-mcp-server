import { z } from 'zod';

// Zod schemas for runtime validation
export const ExecuteTestSuiteArgsSchema = z.object({
    projectPath: z.string().min(1, 'Project path is required'),
    testSuitePath: z.string().min(1, 'Test suite path is required'),
    browser: z.string().optional().default('Chrome'),
    executionProfile: z.string().optional().default('default'),
    browserConfig: z
        .object({
            browserType: z.string(),
            headless: z.boolean().optional(),
            windowSize: z.string().optional(),
            userAgent: z.string().optional(),
            arguments: z.array(z.string()).optional(),
        })
        .optional(),
    reportFolder: z.string().optional(),
    consoleLog: z.boolean().optional().default(true),
    retry: z.number().min(0).optional().default(0),
});

export const AnalyzeProjectArgsSchema = z.object({
    projectPath: z.string().min(1, 'Project path is required'),
    includeTestCases: z.boolean().optional().default(true),
    includeTestSuites: z.boolean().optional().default(true),
    includeObjectRepository: z.boolean().optional().default(true),
    includeKeywords: z.boolean().optional().default(true),
    outputFormat: z.enum(['detailed', 'summary', 'json']).optional().default('detailed'),
});

export const CreateTestCaseArgsSchema = z.object({
    projectPath: z.string().min(1, 'Project path is required'),
    testCaseName: z.string().min(1, 'Test case name is required'),
    testCaseType: z.enum(['web', 'api', 'mobile', 'database']).optional().default('web'),
    description: z.string().optional(),
    template: z.enum(['basic', 'login', 'api', 'data-driven', 'mobile']).optional().default('basic'),
    targetFolder: z.string().optional(),
});

export const ManageObjectRepositoryArgsSchema = z.object({
    projectPath: z.string().min(1, 'Project path is required'),
    action: z.enum(['create', 'update', 'delete', 'heal', 'analyze']),
    objectName: z.string().optional(),
    selector: z.string().optional(),
    selectorType: z
        .enum(['xpath', 'css', 'id', 'name', 'class', 'tag', 'link_text', 'partial_link_text'])
        .optional(),
    description: z.string().optional(),
    smartHealingEnabled: z.boolean().optional().default(false),
});

export const ManageKeywordsArgsSchema = z.object({
    projectPath: z.string().min(1, 'Project path is required'),
    action: z.enum(['list_builtin', 'list_custom', 'create_custom', 'update_custom']),
    keywordName: z.string().optional(),
    keywordCode: z.string().optional(),
    description: z.string().optional(),
    parameters: z
        .array(
            z.object({
                name: z.string(),
                type: z.string(),
                description: z.string(),
                required: z.boolean(),
                defaultValue: z.string().optional(),
            })
        )
        .optional(),
});

export const TestDesignPromptArgsSchema = z.object({
    testType: z
        .enum(['functional', 'regression', 'smoke', 'integration', 'e2e'])
        .optional()
        .default('functional'),
    applicationType: z.enum(['web', 'mobile', 'api', 'desktop']).optional().default('web'),
    complexity: z.enum(['basic', 'intermediate', 'advanced']).optional().default('basic'),
    includeDataDriven: z.boolean().optional().default(false),
});

export const ObjectIdentificationPromptArgsSchema = z.object({
    elementType: z
        .enum(['button', 'input', 'link', 'dropdown', 'table', 'form', 'generic'])
        .optional()
        .default('generic'),
    locatorStrategy: z.enum(['xpath', 'css', 'id', 'class', 'hybrid']).optional().default('hybrid'),
    includeSmartHealing: z.boolean().optional().default(true),
    applicationFramework: z.string().optional(),
});

// TypeScript interfaces derived from Zod schemas
export type ExecuteTestSuiteArgs = z.infer<typeof ExecuteTestSuiteArgsSchema>;
export type AnalyzeProjectArgs = z.infer<typeof AnalyzeProjectArgsSchema>;
export type CreateTestCaseArgs = z.infer<typeof CreateTestCaseArgsSchema>;
export type ManageObjectRepositoryArgs = z.infer<typeof ManageObjectRepositoryArgsSchema>;
export type ManageKeywordsArgs = z.infer<typeof ManageKeywordsArgsSchema>;
export type TestDesignPromptArgs = z.infer<typeof TestDesignPromptArgsSchema>;
export type ObjectIdentificationPromptArgs = z.infer<typeof ObjectIdentificationPromptArgsSchema>;

// Validation helper functions
export function validateExecuteTestSuiteArgs(args: unknown): ExecuteTestSuiteArgs {
    return ExecuteTestSuiteArgsSchema.parse(args);
}

export function validateAnalyzeProjectArgs(args: unknown): AnalyzeProjectArgs {
    return AnalyzeProjectArgsSchema.parse(args);
}

export function validateCreateTestCaseArgs(args: unknown): CreateTestCaseArgs {
    return CreateTestCaseArgsSchema.parse(args);
}

export function validateManageObjectRepositoryArgs(args: unknown): ManageObjectRepositoryArgs {
    return ManageObjectRepositoryArgsSchema.parse(args);
}

export function validateManageKeywordsArgs(args: unknown): ManageKeywordsArgs {
    return ManageKeywordsArgsSchema.parse(args);
}

export function validateTestDesignPromptArgs(args: unknown): TestDesignPromptArgs {
    return TestDesignPromptArgsSchema.parse(args);
}

export function validateObjectIdentificationPromptArgs(
    args: unknown
): ObjectIdentificationPromptArgs {
    return ObjectIdentificationPromptArgsSchema.parse(args);
}
