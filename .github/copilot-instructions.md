<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Katalon-MCP Server Project Instructions

This is a Model Context Protocol (MCP) server project designed to integrate Katalon Studio with Claude AI for intelligent QA automation.

## Project Context
- **Purpose**: Bridge Katalon Studio/Runtime Engine with Claude AI for enhanced test automation capabilities
- **Technology Stack**: TypeScript, MCP SDK, Katalon Studio integration
- **Target Users**: QA Automation Engineers using Katalon Studio

## Key Features to Implement
1. **Test Suite Collection Management**: Execute existing Katalon test suite collections
2. **Smart Test Case Creation**: Generate new test cases with intelligent object identification
3. **Object Repository Management**: Handle object repositories with smart healing capabilities
4. **Keyword Management**: Support both built-in and custom Katalon keywords
5. **Execution Context**: Provide real-time test execution status and results

## Coding Guidelines
- Follow TypeScript best practices with strict type checking
- Use Zod schemas for data validation
- Implement proper error handling for Katalon processes
- Structure code modularly for different Katalon features
- Include comprehensive logging for debugging test automation issues

## MCP Server Specifics
- Implement tools for Katalon project analysis, test execution, and result reporting
- Provide resources for accessing test case templates, object repositories, and keyword libraries
- Use prompts to guide Claude AI in understanding Katalon-specific automation concepts

## References
- MCP Documentation: https://modelcontextprotocol.io/llms-full.txt
- Katalon SDK Reference: https://github.com/modelcontextprotocol/create-python-server
- Katalon Studio Documentation for API integration points
