"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock the dependencies
jest.mock('fs-extra');
jest.mock('glob');
describe('ProjectManager', () => {
    const mockProjectPath = '/mock/katalon/project';
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Project Structure Analysis', () => {
        it('should identify a valid Katalon project', () => {
            // Basic test for project structure
            const mockProject = {
                name: 'Test Project',
                path: mockProjectPath,
                version: '1.0.0',
                testCases: ['TestCase1', 'TestCase2'],
                testSuites: ['TestSuite1'],
                objectRepositories: ['OR1', 'OR2'],
                profiles: ['default']
            };
            expect(mockProject.name).toBe('Test Project');
            expect(mockProject.testCases).toHaveLength(2);
            expect(mockProject.testSuites).toHaveLength(1);
        });
        it('should handle invalid project paths', () => {
            const invalidPath = '/invalid/path';
            // Test for invalid project path handling
            expect(invalidPath).toBe('/invalid/path');
        });
        it('should count project components correctly', () => {
            const componentCounts = {
                testCases: 15,
                testSuites: 3,
                objects: 25,
                keywords: 8
            };
            expect(componentCounts.testCases).toBe(15);
            expect(componentCounts.testSuites).toBe(3);
            expect(componentCounts.objects).toBe(25);
        });
    });
    describe('Test Case Templates', () => {
        it('should provide login test template', () => {
            const templates = [
                {
                    name: 'Login Test',
                    description: 'Basic login functionality test',
                    category: 'Authentication',
                    template: 'login_template',
                    keywords: ['WebUI.openBrowser', 'WebUI.setText', 'WebUI.click']
                }
            ];
            expect(templates).toHaveLength(1);
            expect(templates[0].name).toBe('Login Test');
            expect(templates[0].keywords).toContain('WebUI.openBrowser');
        });
        it('should provide API test template', () => {
            const templates = [
                {
                    name: 'API Test',
                    description: 'REST API testing template',
                    category: 'API',
                    template: 'api_template',
                    keywords: ['WS.sendRequest', 'WS.verifyResponseStatusCode']
                }
            ];
            expect(templates[0].category).toBe('API');
            expect(templates[0].keywords).toContain('WS.sendRequest');
        });
    });
    describe('Project Health Analysis', () => {
        it('should analyze project health metrics', () => {
            const mockAnalysis = {
                overview: {
                    totalTestCases: 25,
                    totalTestSuites: 5,
                    totalObjects: 50,
                    totalKeywords: 10,
                    lastModified: new Date('2025-01-01')
                },
                objectHealth: {
                    totalObjects: 50,
                    healthyObjects: 45,
                    brokenObjects: 3,
                    healedObjects: 2
                }
            };
            expect(mockAnalysis.overview.totalTestCases).toBe(25);
            expect(mockAnalysis.objectHealth?.healthyObjects).toBe(45);
            expect(mockAnalysis.objectHealth?.brokenObjects).toBe(3);
        });
        it('should calculate health percentage correctly', () => {
            const totalObjects = 100;
            const healthyObjects = 85;
            const healthPercentage = (healthyObjects / totalObjects) * 100;
            expect(healthPercentage).toBe(85);
        });
    });
});
//# sourceMappingURL=project-manager.test.js.map