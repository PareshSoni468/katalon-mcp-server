# Katalon MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9%2B-blue.svg)](https://www.typescriptlang.org/)

A comprehensive Model Context Protocol (MCP) server that bridges Katalon Studio with Claude AI for intelligent QA automation. This project enables seamless integration between your existing Katalon Studio and Katalon Runtime Engine licenses with AI-powered test automation capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Available Tools](#available-tools)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-organization/katalon-mcp-server.git
cd katalon-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## 📋 Prerequisites

Before setting up the Katalon MCP Server, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js (verify with `npm --version`)
- **Katalon Studio** or **Katalon Runtime Engine**: Valid license required
- **Claude Desktop**: For MCP integration ([Download](https://claude.ai/desktop))

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: At least 1GB free space
- **Network**: Internet connection for package installation

### Katalon Setup
- Valid Katalon Studio or Runtime Engine license
- Katalon installation path accessible to the system
- Environment variable `KATALON_HOME` (optional, auto-detected if not set)

## 📦 Installation

### Method 1: Clone from GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-organization/katalon-mcp-server.git

# Navigate to the project directory
cd katalon-mcp-server

# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

### Method 2: Download ZIP

1. Download the latest release from [GitHub Releases](https://github.com/your-organization/katalon-mcp-server/releases)
2. Extract the ZIP file to your desired location
3. Open terminal/command prompt in the extracted folder
4. Run the installation commands:

```bash
npm install
npm run build
```

### Method 3: Automated Setup (Windows)

For Windows users, you can use the provided PowerShell script:

```powershell
# Run the setup script as Administrator
.\setup.ps1
```

This script will:
- Install all dependencies
- Build the project
- Test the server startup
- Display next steps for configuration

## ⚙️ Configuration

### 1. Environment Variables (Optional)

Set up environment variables for better integration:

```bash
# Windows (Command Prompt)
set KATALON_HOME=C:\Program Files\Katalon_Studio_Engine

# Windows (PowerShell)
$env:KATALON_HOME="C:\Program Files\Katalon_Studio_Engine"

# macOS/Linux
export KATALON_HOME="/Applications/Katalon Studio Engine.app/Contents/MacOS"
```

### 2. Claude Desktop Configuration

Add the following configuration to your Claude Desktop settings:

**Location of config file:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "katalon-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/katalon-mcp-server/dist/index.js"],
      "cwd": "/absolute/path/to/katalon-mcp-server"
    }
  }
}
```

**Example configurations by OS:**

**Windows:**
```json
{
  "mcpServers": {
    "katalon-mcp-server": {
      "command": "node",
      "args": ["D:\\Projects\\katalon-mcp-server\\dist\\index.js"],
      "cwd": "D:\\Projects\\katalon-mcp-server"
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "katalon-mcp-server": {
      "command": "node",
      "args": ["/Users/yourname/Projects/katalon-mcp-server/dist/index.js"],
      "cwd": "/Users/yourname/Projects/katalon-mcp-server"
    }
  }
}
```

### 3. Verification

Test your setup by running:

```bash
# Start the server
npm start

# You should see output similar to:
# Katalon MCP Server started successfully
# Listening on stdio...
# Available tools: 6
```

## 🚀 Usage

### Starting the Server

```bash
# Development mode (rebuilds on changes)
npm run dev

# Production mode
npm start

# Watch mode (rebuilds automatically)
npm run watch
```

### Basic Commands in Claude

Once configured, you can use these commands in Claude Desktop:

```
# Analyze a Katalon project
Analyze my Katalon project at C:\MyProject\ECommerce_Tests

# Create a new test case
Create a login test case for my application with username field id="email" and password field id="password"

# Execute a test suite
Execute the regression test suite using Chrome browser

# Manage object repository
Update the checkout button object with smart healing enabled
```

## 🛠️ Available Tools

The Katalon MCP Server provides the following tools for Claude AI:

### 1. Project Analysis
- **Tool**: `katalon_analyze_project`
- **Purpose**: Analyze project structure, health metrics, and provide recommendations
- **Usage**: Provides comprehensive insights into test suite organization and object repository health

### 2. Test Case Management
- **Tool**: `katalon_create_test_case`
- **Purpose**: Create new test cases with intelligent templates
- **Templates**: Login, API Testing, Data-Driven, Mobile, Custom
- **Features**: Automatic object repository integration

### 3. Test Execution
- **Tool**: `katalon_execute_test_suite`
- **Purpose**: Execute test suites with real-time monitoring
- **Features**: Multi-browser support, execution profiles, detailed reporting

### 4. Object Repository Management
- **Tool**: `katalon_manage_object_repository`
- **Purpose**: Advanced object repository operations
- **Features**: Smart healing, object health analysis, bulk operations

### 5. Keyword Management
- **Tool**: `katalon_manage_keywords`
- **Purpose**: Create and manage custom keywords
- **Features**: Built-in templates, parameter handling, documentation generation

### 6. Smart Healing
- **Tool**: `katalon_smart_healing`
- **Purpose**: Automatic object healing and optimization
- **Features**: Multiple fallback strategies, confidence scoring, auto-updates

## 🔧 Development

### Project Structure

```
katalon-mcp-server/
├── src/
│   ├── index.ts                 # Main server entry point
│   └── katalon/
│       ├── keyword-manager.ts   # Keyword management tools
│       ├── object-repository.ts # Object repository operations
│       ├── project-manager.ts   # Project analysis and management
│       ├── smart-healing.ts     # Smart healing functionality
│       └── test-executor.ts     # Test execution engine
├── dist/                        # Compiled JavaScript (generated)
├── package.json                 # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── setup.ps1                  # Windows setup script
├── README.md                   # This file
└── USAGE_EXAMPLES.md          # Comprehensive usage examples
```

### Available Scripts

```bash
# Build the project
npm run build

# Start the server
npm start

# Development mode (build + start)
npm run dev

# Watch mode (auto-rebuild)
npm run watch

# Run tests (if available)
npm test
```

### Building from Source

```bash
# Clone and setup
git clone https://github.com/your-organization/katalon-mcp-server.git
cd katalon-mcp-server
npm install

# Development workflow
npm run watch  # In one terminal (auto-rebuilds)
npm start      # In another terminal (run server)
```

## ✨ Features

### 🚀 Core Capabilities
- **Test Suite Execution**: Execute existing Katalon test suite collections with real-time monitoring
- **Smart Test Case Creation**: Generate new test cases with intelligent object identification
- **Object Repository Management**: Advanced object repository handling with smart healing
- **Keyword Management**: Comprehensive support for built-in and custom Katalon keywords
- **Smart Healing**: Automatic object healing with multiple fallback strategies
- **Execution Analytics**: Detailed test execution reports and insights

### 🔧 Key Components

#### 1. Project Manager (`project-manager.ts`)
- Analyze Katalon project structure and health
- Create new test cases with templates
- Provide project insights and recommendations
- Support for multiple test case templates (Login, API, Data-Driven, Mobile)

#### 2. Test Executor (`test-executor.ts`)
- Execute test suites and test suite collections
- Real-time execution monitoring and logging
- Comprehensive execution reports with screenshots
- Support for multiple browsers and execution profiles
- Cross-platform Katalon Runtime Engine detection

#### 3. Object Repository Manager (`object-repository.ts`)
- Advanced object repository operations
- Smart healing configuration and management
- Object health analysis and recommendations
- Bulk object operations and optimization

#### 4. Keyword Manager (`keyword-manager.ts`)
- Create and manage custom keywords
- Built-in keyword templates and best practices
- Parameter handling and validation
- Documentation generation for custom keywords

#### 5. Smart Healing Engine (`smart-healing.ts`)
- Automatic object healing with confidence scoring
- Multiple fallback strategies (XPath, CSS, attributes)
- Learning from previous healing attempts
- Integration with object repository for seamless updates

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/katalon-mcp-server.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Guidelines

- Follow TypeScript best practices
- Add appropriate error handling
- Include JSDoc comments for public methods
- Test your changes thoroughly
- Update documentation as needed

### Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```
2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Create a Pull Request** on GitHub

### Commit Message Convention

We use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `refactor:` for code refactoring
- `test:` for adding tests

## 🐛 Troubleshooting

### Common Issues

#### 1. **Katalon Runtime Engine Not Found**
```
Error: Could not locate Katalon Runtime Engine
```
**Solution:**
- Ensure Katalon is installed and accessible
- Set `KATALON_HOME` environment variable
- Verify Katalon license is valid

#### 2. **Node.js Version Issues**
```
Error: Node.js version 18.0.0 or higher is required
```
**Solution:**
- Update Node.js to version 18+ from [nodejs.org](https://nodejs.org/)
- Use Node Version Manager (nvm) to manage versions

#### 3. **Permission Errors (Windows)**
```
Error: EACCES permission denied
```
**Solution:**
- Run terminal as Administrator
- Check folder permissions
- Ensure antivirus isn't blocking the application

#### 4. **TypeScript Compilation Errors**
```
Error: Cannot find module or type declarations
```
**Solution:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure TypeScript version compatibility

#### 5. **Claude Desktop Not Connecting**
```
MCP server not appearing in Claude Desktop
```
**Solution:**
- Verify config file location and syntax
- Use absolute paths in configuration
- Restart Claude Desktop after configuration changes
- Check server logs for errors

### Getting Help

- **Issues**: Report bugs on [GitHub Issues](https://github.com/your-organization/katalon-mcp-server/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/your-organization/katalon-mcp-server/discussions)
- **Documentation**: Check [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for detailed examples

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
DEBUG=katalon-mcp-server npm start

# Or on Windows PowerShell
$env:DEBUG="katalon-mcp-server"; npm start
```

## 📚 Documentation

- **[Usage Examples](./USAGE_EXAMPLES.md)**: Comprehensive examples and use cases
- **[API Documentation](#)**: Detailed API reference (coming soon)
- **[Best Practices](#)**: Recommended practices for optimal usage (coming soon)

## 🏗️ Architecture

The Katalon MCP Server follows a modular architecture:

```
┌─────────────────┐
│   Claude AI     │
└─────────┬───────┘
          │ MCP Protocol
┌─────────▼───────┐
│  MCP Server     │
│  (index.ts)     │
└─────────┬───────┘
          │
    ┌─────▼─────┐
    │  Katalon  │
    │  Modules  │
    └─────┬─────┘
          │
┌─────────▼───────┐
│ Katalon Studio/ │
│ Runtime Engine  │
└─────────────────┘
```

## 🔒 Security Considerations

- **Local Execution**: All operations execute locally on your machine
- **No Data Transmission**: Test data and project information stay on your system
- **License Respect**: Requires valid Katalon license for all operations
- **File System Access**: Limited to specified project directories

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for the Model Context Protocol specification
- **Katalon** for the comprehensive test automation platform
- **TypeScript** community for excellent tooling
- **Open Source Contributors** who make projects like this possible

---

**Made with ❤️ for the QA Automation Community**

For more examples and advanced usage patterns, see [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md).
- Create, update, and delete test objects
- Smart healing capabilities for dynamic elements
- Object health analysis and recommendations
- Best practices guidance for object identification
- Duplicate selector detection and resolution

#### 4. Keyword Manager (`keyword-manager.ts`)
- Browse 150+ built-in Katalon keywords with examples
- Create and manage custom keywords
- Keyword usage analytics and recommendations
- Code generation assistance for common patterns

#### 5. Smart Healing System (`smart-healing.ts`)
- Automatic object healing with 6 different strategies
- Configurable healing confidence thresholds
- Healing attempt history and analytics
- Visual recognition capabilities (extensible)
- Comprehensive healing reports and recommendations

## Installation

### Prerequisites
- Node.js 18+ 
- Katalon Studio or Katalon Runtime Engine
- TypeScript 5+

### Setup
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Start the MCP server:
   ```bash
   npm start
   ```

## Configuration

### Katalon Integration
The server automatically detects Katalon installations in common locations:
- Windows: `C:\\Katalon_Studio_Engine\\katalonc.exe`
- macOS: `/Applications/Katalon Studio.app/Contents/MacOS/katalonc`
- Linux: `/opt/katalon/katalonc`
- Environment: `$KATALON_HOME/katalonc`

### Smart Healing Configuration
Configure smart healing behavior in your project:
```json
{
  "enabled": true,
  "confidenceThreshold": 0.8,
  "maxHealingAttempts": 3,
  "reportFailures": true,
  "autoUpdateObjects": false,
  "healingStrategies": [
    "attribute_fallback",
    "xpath_optimization", 
    "css_conversion",
    "text_content_matching",
    "relative_positioning"
  ]
}
```

## MCP Tools

### Test Execution
```typescript
// Execute a test suite
await mcp.callTool('katalon_execute_test_suite', {
  projectPath: '/path/to/katalon/project',
  testSuitePath: 'Test Suites/Regression Suite.ts',
  browser: 'Chrome',
  executionProfile: 'production'
});
```

### Test Case Creation
```typescript
// Create a new test case
await mcp.callTool('katalon_create_test_case', {
  projectPath: '/path/to/katalon/project',
  testCaseName: 'User_Login_Success',
  description: 'Test successful user login with valid credentials',
  testSteps: [
    'Navigate to login page',
    'Enter valid username',
    'Enter valid password', 
    'Click login button',
    'Verify successful login'
  ]
});
```

### Object Repository Management
```typescript
// Create a new object with smart healing
await mcp.callTool('katalon_manage_object_repository', {
  projectPath: '/path/to/katalon/project',
  action: 'create',
  objectName: 'login_username_field',
  selector: '#username',
  selectorType: 'css',
  smartHealingEnabled: true
});
```

### Keyword Management
```typescript
// List built-in keywords
await mcp.callTool('katalon_manage_keywords', {
  projectPath: '/path/to/katalon/project',
  action: 'list_builtin'
});

// Create custom keyword
await mcp.callTool('katalon_manage_keywords', {
  projectPath: '/path/to/katalon/project',
  action: 'create_custom',
  keywordName: 'verifyLoginSuccess',
  keywordCode: `
    WebUI.verifyElementPresent(findTestObject('Dashboard/welcome_message'), 10)
    WebUI.verifyElementText(findTestObject('Dashboard/user_name'), username)
  `
});
```

## MCP Resources

### Test Templates
Access comprehensive test case templates:
```
katalon://test-templates
```

### Object Repository Best Practices
Get guidance on object identification:
```
katalon://object-repository-patterns
```

### Keyword Library
Browse the complete keyword library:
```
katalon://keyword-library
```

## MCP Prompts

### Test Design Guidance
```typescript
await mcp.getPrompt('katalon_test_design', {
  application_type: 'web',
  test_scope: 'regression'
});
```

### Object Identification Help
```typescript
await mcp.getPrompt('katalon_object_identification', {
  element_type: 'button'
});
```

## Development

### Building
```bash
npm run build        # Compile TypeScript
npm run watch        # Watch mode for development
npm run dev          # Build and run
```

### Testing
```bash
npm test            # Run tests (when implemented)
```

## Integration with Claude AI

This MCP server is designed to work seamlessly with Claude AI, providing:

1. **Contextual Test Automation**: Claude can understand your Katalon project structure and suggest appropriate test strategies
2. **Intelligent Object Identification**: AI-powered recommendations for robust object selectors
3. **Smart Test Case Generation**: Generate test cases based on requirements or user stories
4. **Automated Problem Resolution**: Use smart healing insights to improve test stability
5. **Best Practice Guidance**: Get AI-powered recommendations for test automation improvements

### Example Claude Integration

```
"I need to test the checkout process for an e-commerce site. The application has dynamic element IDs that change between deployments."

Claude with Katalon MCP Server can:
- Analyze your existing test structure
- Suggest robust object identification strategies
- Create test cases with smart healing enabled
- Provide best practices for handling dynamic elements
- Generate comprehensive test data scenarios
```

## Architecture

```
Katalon MCP Server
├── MCP Protocol Layer (index.ts)
│   ├── Tools (execute, create, manage)
│   ├── Resources (templates, guides, libraries)
│   └── Prompts (design guidance, best practices)
├── Katalon Integration Layer
│   ├── Project Manager (analysis, creation)
│   ├── Test Executor (execution, monitoring)
│   ├── Object Repository (management, healing)
│   ├── Keyword Manager (built-in, custom)
│   └── Smart Healing (strategies, reporting)
└── Katalon Runtime Engine Interface
    ├── Command Line Integration
    ├── Report Parsing
    └── File System Management
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [Katalon MCP Server Docs](link-to-docs)
- **Issues**: [GitHub Issues](https://github.com/your-repo/katalon-mcp-server/issues)
- **Community**: [Katalon Community](https://community.katalon.com/)

## Acknowledgments

- [Katalon Studio](https://katalon.com/) for the excellent test automation platform
- [Model Context Protocol](https://modelcontextprotocol.io/) for the integration framework
- [Anthropic Claude](https://claude.ai/) for AI-powered automation capabilities

---

**Built with ❤️ for QA Automation Engineers**
