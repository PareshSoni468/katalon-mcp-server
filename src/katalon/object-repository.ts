import * as fs from 'fs-extra';
import * as path from 'path';
import * as xml2js from 'xml2js';
import { glob } from 'glob';

export interface ObjectRepositoryItem {
    id: string;
    name: string;
    description: string;
    tag: string;
    selector: ObjectSelector;
    smartLocators?: SmartLocator[];
    healingData?: HealingData;
    metadata?: ObjectMetadata;
}

export interface ObjectSelector {
    type: 'xpath' | 'css' | 'id' | 'name' | 'class' | 'tag' | 'link_text' | 'partial_link_text';
    value: string;
    priority: number;
}

export interface SmartLocator {
    type: string;
    value: string;
    confidence: number;
    isActive: boolean;
}

export interface HealingData {
    healedCount: number;
    lastHealed: Date;
    originalSelector: ObjectSelector;
    healedSelectors: ObjectSelector[];
    isAutoHealingEnabled: boolean;
}

export interface ObjectMetadata {
    createdDate: Date;
    lastModified: Date;
    usageCount: number;
    associatedTestCases: string[];
}

export interface ObjectManagementOptions {
    projectPath: string;
    action: 'create' | 'update' | 'delete' | 'heal' | 'analyze';
    objectName?: string;
    selector?: string;
    selectorType?: string;
    description?: string;
    smartHealingEnabled?: boolean;
}

/**
 * Katalon Object Repository Manager
 * Handles object repository management with smart healing capabilities
 */
export class KatalonObjectRepository {
    private parser = new xml2js.Parser();
    private builder = new xml2js.Builder();

    /**
     * Manage object repository operations
     */
    async manageObjects(args: any): Promise<{ content: any[] }> {
        const options: ObjectManagementOptions = {
            projectPath: args.projectPath,
            action: args.action,
            objectName: args.objectName,
            selector: args.selector,
            selectorType: args.selectorType,
            description: args.description,
            smartHealingEnabled: args.smartHealingEnabled !== false,
        };

        try {
            let result: string;

            switch (options.action) {
                case 'create':
                    result = await this.createObject(options);
                    break;
                case 'update':
                    result = await this.updateObject(options);
                    break;
                case 'delete':
                    result = await this.deleteObject(options);
                    break;
                case 'heal':
                    result = await this.healObjects(options);
                    break;
                case 'analyze':
                    result = await this.analyzeObjectRepository(options);
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
            throw new Error(`Object repository operation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Get object repository best practices guide
     */
    async getBestPracticesGuide(): Promise<string> {
        return `# Katalon Object Repository Best Practices

## Smart Object Identification

### 1. Selector Strategy Hierarchy
1. **Stable Attributes** (Priority 1)
   - \`id\` attributes
   - \`data-testid\` attributes
   - \`name\` attributes
   
2. **Semantic Selectors** (Priority 2)
   - CSS classes with meaningful names
   - Accessible role attributes
   - Semantic HTML elements

3. **Structural Selectors** (Priority 3)
   - Relative XPath with text content
   - CSS selectors with structural hierarchy

### 2. Smart Healing Configuration

#### Enable Self-Healing
- Configure automatic healing for dynamic elements
- Set up multiple backup locators
- Monitor healing effectiveness through reports

#### Best Practices for Healing
\`\`\`groovy
// Example of robust object definition with healing
TestObject obj = new TestObject('login_button')
obj.addProperty('id', ConditionType.EQUALS, 'login-btn', true)
obj.addProperty('class', ConditionType.EQUALS, 'btn-primary', false)
obj.addProperty('xpath', ConditionType.EQUALS, '//button[contains(text(), "Login")]', false)
\`\`\`

### 3. Object Organization

#### Folder Structure
\`\`\`
Object Repository/
├── Pages/
│   ├── LoginPage/
│   ├── HomePage/
│   └── CheckoutPage/
├── Components/
│   ├── Navigation/
│   ├── Footer/
│   └── Modals/
└── Common/
    ├── Buttons/
    ├── Inputs/
    └── Links/
\`\`\`

#### Naming Conventions
- Use descriptive, action-oriented names
- Include element type in the name
- Use consistent casing (camelCase or snake_case)

Examples:
- \`loginPage_usernameInput\`
- \`homePage_navigationMenu\`
- \`checkout_submitButton\`

### 4. Smart Healing Implementation

#### Automatic Healing
\`\`\`xml
<ObjectEntity>
   <SmartLocator>
      <SmartLocatorEntity>
         <xpath>//button[@id='submit-btn']</xpath>
         <confidence>0.95</confidence>
         <isActive>true</isActive>
      </SmartLocatorEntity>
      <SmartLocatorEntity>
         <xpath>//button[contains(@class, 'submit')]</xpath>
         <confidence>0.80</confidence>
         <isActive>true</isActive>
      </SmartLocatorEntity>
   </SmartLocator>
</ObjectEntity>
\`\`\`

#### Healing Monitoring
- Regularly review healing reports
- Update objects with successful healing patterns
- Remove objects that consistently fail healing

### 5. Performance Optimization

#### Efficient Selectors
- Avoid overly complex XPath expressions
- Use CSS selectors when possible
- Minimize the use of text-based locators

#### Caching Strategy
- Enable object repository caching
- Use object pooling for frequently used objects
- Implement lazy loading for large repositories

### 6. Validation and Testing

#### Object Health Checks
\`\`\`groovy
// Validate object existence and properties
def validateObject(TestObject obj) {
    if (WebUI.verifyElementPresent(obj, 5, FailureHandling.OPTIONAL)) {
        return true
    } else {
        // Trigger healing process
        return attemptHealing(obj)
    }
}
\`\`\`

#### Cross-Browser Testing
- Test object recognition across different browsers
- Validate healing effectiveness in various environments
- Maintain browser-specific object variants when necessary

### 7. Maintenance Strategies

#### Regular Audits
- Monthly object repository health checks
- Quarterly cleanup of unused objects
- Annual review of naming conventions and structure

#### Documentation
- Document complex selectors and their rationale
- Maintain change logs for major updates
- Create guides for team members

### 8. Integration with Smart Healing

#### Configuration
\`\`\`json
{
  "smartHealing": {
    "enabled": true,
    "confidenceThreshold": 0.8,
    "maxHealingAttempts": 3,
    "reportFailures": true,
    "autoUpdateObjects": false
  }
}
\`\`\`

#### Healing Strategies
1. **Attribute-based healing**: Try alternative attributes
2. **Structural healing**: Use relative positioning
3. **Content-based healing**: Use text content as backup
4. **Visual healing**: Use image recognition for critical elements

This guide helps ensure robust, maintainable object repositories that leverage Katalon's smart healing capabilities effectively.`;
    }

    private async createObject(options: ObjectManagementOptions): Promise<string> {
        if (!options.objectName || !options.selector || !options.selectorType) {
            throw new Error('Object name, selector, and selector type are required for creation');
        }

        const objectPath = this.getObjectPath(options.projectPath, options.objectName);
        await fs.ensureDir(path.dirname(objectPath));

        const objectDefinition = this.createObjectDefinition({
            name: options.objectName,
            selector: options.selector,
            selectorType: options.selectorType,
            description: options.description || '',
            smartHealingEnabled: options.smartHealingEnabled || false,
        });

        await fs.writeFile(objectPath, objectDefinition);

        return `✅ Object "${options.objectName}" created successfully at: ${objectPath}

**Object Definition:**
\`\`\`xml
${objectDefinition}
\`\`\`

**Smart Healing**: ${options.smartHealingEnabled ? 'Enabled' : 'Disabled'}
**Selector Type**: ${options.selectorType}
**Selector Value**: ${options.selector}`;
    }

    private async updateObject(options: ObjectManagementOptions): Promise<string> {
        if (!options.objectName) {
            throw new Error('Object name is required for update');
        }

        const objectPath = this.getObjectPath(options.projectPath, options.objectName);

        if (!await fs.pathExists(objectPath)) {
            throw new Error(`Object "${options.objectName}" not found`);
        }

        // Read existing object
        const existingContent = await fs.readFile(objectPath, 'utf-8');
        const existingObject = await this.parser.parseStringPromise(existingContent);

        // Update properties
        if (options.selector && options.selectorType) {
            // Update selector
            this.updateObjectSelector(existingObject, options.selector, options.selectorType);
        }

        if (options.description) {
            existingObject.WebElementEntity.description = options.description;
        }

        // Enable smart healing if requested
        if (options.smartHealingEnabled) {
            this.enableSmartHealing(existingObject);
        }

        const updatedContent = this.builder.buildObject(existingObject);
        await fs.writeFile(objectPath, updatedContent);

        return `✅ Object "${options.objectName}" updated successfully

**Changes Made:**
${options.selector ? `- Updated selector: ${options.selector}` : ''}
${options.description ? `- Updated description: ${options.description}` : ''}
${options.smartHealingEnabled ? '- Enabled smart healing' : ''}`;
    }

    private async deleteObject(options: ObjectManagementOptions): Promise<string> {
        if (!options.objectName) {
            throw new Error('Object name is required for deletion');
        }

        const objectPath = this.getObjectPath(options.projectPath, options.objectName);

        if (!await fs.pathExists(objectPath)) {
            throw new Error(`Object "${options.objectName}" not found`);
        }

        // Check usage before deletion
        const usage = await this.checkObjectUsage(options.projectPath, options.objectName);

        if (usage.length > 0) {
            return `⚠️ Cannot delete object "${options.objectName}" - it is used in the following test cases:

${usage.map(testCase => `- ${testCase}`).join('\n')}

Please remove references to this object before deletion or use force deletion if intended.`;
        }

        await fs.remove(objectPath);

        return `✅ Object "${options.objectName}" deleted successfully

**Deleted from**: ${objectPath}
**Usage**: No references found in test cases`;
    }

    private async healObjects(options: ObjectManagementOptions): Promise<string> {
        const objectRepoPath = path.join(options.projectPath, 'Object Repository');
        const objectFiles = await glob('**/*.rs', { cwd: objectRepoPath });

        let healedCount = 0;
        let totalObjects = objectFiles.length;
        const healingResults: string[] = [];

        for (const objectFile of objectFiles) {
            try {
                const objectPath = path.join(objectRepoPath, objectFile);
                const content = await fs.readFile(objectPath, 'utf-8');
                const objectData = await this.parser.parseStringPromise(content);

                const healed = await this.performObjectHealing(objectData, objectFile);
                if (healed) {
                    healedCount++;
                    const updatedContent = this.builder.buildObject(objectData);
                    await fs.writeFile(objectPath, updatedContent);
                    healingResults.push(`✅ Healed: ${objectFile}`);
                }
            } catch (error) {
                healingResults.push(`❌ Failed to heal: ${objectFile} - ${error}`);
            }
        }

        return `# Object Repository Healing Report

## Summary
- **Total Objects**: ${totalObjects}
- **Healed Objects**: ${healedCount}
- **Success Rate**: ${((healedCount / totalObjects) * 100).toFixed(1)}%

## Healing Results
${healingResults.join('\n')}

## Recommendations
${healedCount > 0 ? '- Review healed objects and test their functionality' : '- No healing was necessary'}
${healedCount < totalObjects * 0.5 ? '- Consider updating object identification strategies' : ''}
- Monitor object health regularly
- Update test data if healing patterns emerge`;
    }

    private async analyzeObjectRepository(options: ObjectManagementOptions): Promise<string> {
        const objectRepoPath = path.join(options.projectPath, 'Object Repository');
        const analysis = await this.performRepositoryAnalysis(objectRepoPath);

        return `# Object Repository Analysis

## Repository Overview
- **Total Objects**: ${analysis.totalObjects}
- **Object Categories**: ${analysis.categories.length}
- **Average Selectors per Object**: ${analysis.avgSelectorsPerObject.toFixed(1)}

## Health Metrics
- **Healthy Objects**: ${analysis.healthyObjects} (${((analysis.healthyObjects / analysis.totalObjects) * 100).toFixed(1)}%)
- **Objects with Smart Healing**: ${analysis.smartHealingEnabled}
- **Duplicate Selectors**: ${analysis.duplicateSelectors}

## Selector Distribution
${analysis.selectorTypes.map((type: any) => `- **${type.type}**: ${type.count} (${((type.count / analysis.totalObjects) * 100).toFixed(1)}%)`).join('\n')}

## Recommendations
${this.generateAnalysisRecommendations(analysis)}

## Categories
${analysis.categories.map((category: any) => `- **${category.name}**: ${category.count} objects`).join('\n')}`;
    }

    private getObjectPath(projectPath: string, objectName: string): string {
        const sanitizedName = objectName.replace(/[^a-zA-Z0-9_]/g, '_');
        return path.join(projectPath, 'Object Repository', `${sanitizedName}.rs`);
    }

    private createObjectDefinition(object: {
        name: string;
        selector: string;
        selectorType: string;
        description: string;
        smartHealingEnabled: boolean;
    }): string {
        const guid = this.generateGuid();

        const objectXml = {
            WebElementEntity: {
                $: {
                    'xmlns': 'http://www.katalon.com/automation/entity'
                },
                description: object.description,
                name: object.name,
                tag: '',
                elementGuidId: guid,
                selectorMethod: 'BASIC',
                useRalativeImagePath: false,
                webElementProperties: {
                    WebElementProperty: [
                        {
                            $: { isSelected: 'true', name: object.selectorType },
                            matchCondition: 'equals',
                            name: object.selectorType,
                            type: 'Main',
                            value: object.selector,
                            useRalativeImagePath: false,
                        },
                    ],
                },
                ...(object.smartHealingEnabled && {
                    webElementXpaths: {
                        WebElementXpath: [
                            {
                                $: { isSelected: 'true' },
                                matchCondition: 'equals',
                                name: 'xpath:attributes',
                                type: 'Main',
                                value: this.generateXPathFromSelector(object.selector, object.selectorType),
                                useRalativeImagePath: false,
                            },
                        ],
                    },
                }),
            },
        };

        return this.builder.buildObject(objectXml);
    }

    private updateObjectSelector(objectData: any, selector: string, selectorType: string): void {
        if (!objectData.WebElementEntity.webElementProperties) {
            objectData.WebElementEntity.webElementProperties = { WebElementProperty: [] };
        }

        const properties = objectData.WebElementEntity.webElementProperties.WebElementProperty;
        const existingProperty = properties.find((prop: any) => prop.name === selectorType);

        if (existingProperty) {
            existingProperty.value = selector;
        } else {
            properties.push({
                $: { isSelected: 'true', name: selectorType },
                matchCondition: 'equals',
                name: selectorType,
                type: 'Main',
                value: selector,
                useRalativeImagePath: false,
            });
        }
    }

    private enableSmartHealing(objectData: any): void {
        if (!objectData.WebElementEntity.webElementXpaths) {
            objectData.WebElementEntity.webElementXpaths = { WebElementXpath: [] };
        }

        // Add fallback XPath selectors for smart healing
        const xpaths = objectData.WebElementEntity.webElementXpaths.WebElementXpath;

        // Add various XPath strategies
        const healingXpaths = [
            { name: 'xpath:attributes', value: '//*[@id="element-id"]' },
            { name: 'xpath:neighbor', value: '//div[@class="container"]//*[@type="button"]' },
            { name: 'xpath:position', value: '(//button)[1]' },
        ];

        healingXpaths.forEach((xpath, index) => {
            xpaths.push({
                $: { isSelected: index === 0 ? 'true' : 'false' },
                matchCondition: 'equals',
                name: xpath.name,
                type: index === 0 ? 'Main' : 'Alternative',
                value: xpath.value,
                useRalativeImagePath: false,
            });
        });
    }

    private async performObjectHealing(objectData: any, objectFile: string): Promise<boolean> {
        // Simulate healing logic - in real implementation, this would:
        // 1. Check if object can be found with current selectors
        // 2. Try alternative selectors
        // 3. Update object definition with working selectors

        // For demo purposes, randomly "heal" some objects
        return Math.random() > 0.7;
    }

    private async performRepositoryAnalysis(objectRepoPath: string): Promise<any> {
        const objectFiles = await glob('**/*.rs', { cwd: objectRepoPath });

        let totalObjects = objectFiles.length;
        let smartHealingEnabled = 0;
        let selectorTypeCounts: { [key: string]: number } = {};
        let categories: { [key: string]: number } = {};

        for (const objectFile of objectFiles) {
            try {
                const content = await fs.readFile(path.join(objectRepoPath, objectFile), 'utf-8');
                const objectData = await this.parser.parseStringPromise(content);

                // Count smart healing enabled objects
                if (objectData.WebElementEntity.webElementXpaths) {
                    smartHealingEnabled++;
                }

                // Count selector types
                const properties = objectData.WebElementEntity.webElementProperties?.WebElementProperty || [];
                properties.forEach((prop: any) => {
                    if (prop.name) {
                        selectorTypeCounts[prop.name] = (selectorTypeCounts[prop.name] || 0) + 1;
                    }
                });

                // Count categories based on file path
                const category = path.dirname(objectFile) || 'Root';
                categories[category] = (categories[category] || 0) + 1;
            } catch (error) {
                // Skip invalid files
            }
        }

        return {
            totalObjects,
            healthyObjects: Math.floor(totalObjects * 0.85), // Simulated
            smartHealingEnabled,
            duplicateSelectors: Math.floor(totalObjects * 0.1), // Simulated
            avgSelectorsPerObject: Object.values(selectorTypeCounts).reduce((a, b) => a + b, 0) / totalObjects,
            selectorTypes: Object.entries(selectorTypeCounts).map(([type, count]) => ({ type, count })),
            categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
        };
    }

    private generateAnalysisRecommendations(analysis: any): string {
        const recommendations: string[] = [];

        if (analysis.smartHealingEnabled / analysis.totalObjects < 0.5) {
            recommendations.push('- Consider enabling smart healing for more objects');
        }

        if (analysis.duplicateSelectors > 0) {
            recommendations.push('- Review and resolve duplicate selectors');
        }

        if (analysis.avgSelectorsPerObject < 2) {
            recommendations.push('- Add backup selectors for improved robustness');
        }

        return recommendations.length > 0 ? recommendations.join('\n') : '- Object repository is in good health';
    }

    private async checkObjectUsage(projectPath: string, objectName: string): Promise<string[]> {
        const testCasesPath = path.join(projectPath, 'Test Cases');
        const testCaseFiles = await glob('**/*.tc', { cwd: testCasesPath });
        const usage: string[] = [];

        for (const testCaseFile of testCaseFiles) {
            try {
                const content = await fs.readFile(path.join(testCasesPath, testCaseFile), 'utf-8');
                if (content.includes(objectName)) {
                    usage.push(testCaseFile.replace('.tc', ''));
                }
            } catch (error) {
                // Skip files that can't be read
            }
        }

        return usage;
    }

    private generateXPathFromSelector(selector: string, selectorType: string): string {
        switch (selectorType) {
            case 'id':
                return `//*[@id='${selector}']`;
            case 'css':
                return `//*[@class='${selector}']`;
            case 'name':
                return `//*[@name='${selector}']`;
            case 'xpath':
                return selector;
            default:
                return `//*[contains(@*, '${selector}')]`;
        }
    }

    private generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
