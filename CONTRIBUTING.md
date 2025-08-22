# Contributing to Katalon MCP Server

Thank you for considering contributing to the Katalon MCP Server! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 📝 Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be collaborative**: Work together to improve the project
- **Be constructive**: Provide helpful feedback and suggestions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- TypeScript knowledge
- Basic understanding of Katalon Studio
- Familiarity with Model Context Protocol (MCP)

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/katalon-mcp-server.git
   cd katalon-mcp-server
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-org/katalon-mcp-server.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Build the project**:
   ```bash
   npm run build
   ```

## 🔧 Development Setup

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Start development mode**:
   ```bash
   npm run watch  # Auto-rebuild on changes
   ```

3. **Test your changes**:
   ```bash
   npm run dev    # Start server in development mode
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Project Structure

```
src/
├── index.ts                 # Main server entry point
└── katalon/
    ├── keyword-manager.ts   # Keyword management
    ├── object-repository.ts # Object repository operations
    ├── project-manager.ts   # Project analysis
    ├── smart-healing.ts     # Smart healing functionality
    └── test-executor.ts     # Test execution
```

## 📝 Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues and improve stability
- **Feature enhancements**: Add new capabilities
- **Documentation improvements**: Enhance README, guides, examples
- **Performance optimizations**: Improve speed and efficiency
- **Testing**: Add or improve test coverage
- **Examples**: Create usage examples and tutorials

### Before Contributing

1. **Check existing issues**: Look for related issues or discussions
2. **Create an issue**: For significant changes, create an issue first
3. **Discuss your approach**: Get feedback before starting work
4. **Follow conventions**: Adhere to coding standards and patterns

### Commit Message Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(executor): add multi-browser test execution
fix(healing): resolve object selector fallback issue
docs(readme): update installation instructions
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch** with the latest changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** and ensure they pass:
   ```bash
   npm test
   npm run build
   ```

3. **Update documentation** if needed
4. **Check code quality** and formatting

### Pull Request Guidelines

1. **Create a descriptive title** and description
2. **Reference related issues** using keywords (e.g., "Closes #123")
3. **Provide context** about the changes
4. **Include testing information**
5. **Update CHANGELOG.md** if applicable

### Review Process

- All PRs require at least one review
- Address feedback promptly and professionally
- Be open to suggestions and improvements
- Maintainers may request changes or provide guidance

## 🎯 Coding Standards

### TypeScript Guidelines

- **Use TypeScript strict mode**: Enable all strict type checking
- **Explicit types**: Provide type annotations for public APIs
- **JSDoc comments**: Document public methods and classes
- **Error handling**: Use proper error handling and logging

### Code Style

- **Indentation**: 2 spaces (no tabs)
- **Line length**: Maximum 100 characters
- **Semicolons**: Always use semicolons
- **Quotes**: Use single quotes for strings
- **Naming**: Use camelCase for variables and functions, PascalCase for classes

### Example Code Style

```typescript
/**
 * Executes a Katalon test suite with specified options
 * @param suitePath - Path to the test suite file
 * @param options - Execution options
 * @returns Promise with execution results
 */
export async function executeTestSuite(
  suitePath: string,
  options: ExecutionOptions
): Promise<ExecutionResult> {
  try {
    const executor = new TestExecutor(options);
    const result = await executor.run(suitePath);
    return result;
  } catch (error) {
    console.error('Test execution failed:', error);
    throw new Error(`Failed to execute test suite: ${error.message}`);
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for new functions and classes
- Include integration tests for complex workflows
- Test error conditions and edge cases
- Use descriptive test names and organized test suites

### Test Structure

```typescript
describe('TestExecutor', () => {
  describe('executeTestSuite', () => {
    it('should execute test suite successfully', async () => {
      // Arrange
      const suitePath = '/path/to/test/suite';
      const options = { browser: 'chrome' };
      
      // Act
      const result = await executeTestSuite(suitePath, options);
      
      // Assert
      expect(result.status).toBe('passed');
      expect(result.duration).toBeGreaterThan(0);
    });
  });
});
```

## 📚 Documentation

### Documentation Requirements

- **Code comments**: Use JSDoc for public APIs
- **README updates**: Update README for new features
- **Usage examples**: Provide examples in USAGE_EXAMPLES.md
- **Change documentation**: Update CHANGELOG.md

### Documentation Style

- Use clear, concise language
- Provide code examples where applicable
- Include both basic and advanced usage scenarios
- Keep documentation up-to-date with code changes

## ❓ Getting Help

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Request Comments**: For code-specific discussions

### Questions and Support

If you have questions:

1. Check existing documentation and issues
2. Search previous discussions
3. Create a new issue with the "question" label
4. Provide context and specific details

## 🏆 Recognition

Contributors will be recognized in:

- Project README contributors section
- Release notes for significant contributions
- GitHub contributors page

Thank you for contributing to the Katalon MCP Server! Your efforts help make QA automation more accessible and intelligent for everyone.

---

**Happy Contributing! 🎉**
