# Katalon MCP Server Usage Examples

This document provides comprehensive examples of how to use the Katalon MCP Server with Claude AI for intelligent QA automation.

## Setup and Configuration

### 1. Initial Setup
```bash
# Clone and setup the project
git clone <repository-url>
cd katalon-mcp-server
npm install
npm run build
npm start
```

### 2. Configure MCP in Claude Desktop
Add to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "katalon-mcp-server": {
      "command": "node",
      "args": ["D:\\AgenticAI\\dist\\index.js"],
      "cwd": "D:\\AgenticAI"
    }
  }
}
```

## Usage Examples

### Example 1: Analyzing an Existing Katalon Project

```
Claude, I have a Katalon project at C:\MyProjects\ECommerce_Tests. Can you analyze it and give me an overview of its health and structure?
```

**Expected Claude Response using MCP:**
```
I'll analyze your Katalon project to provide insights into its structure and health.

[Uses katalon_analyze_project tool]

# Project Analysis Results

## Overview
- **Total Test Cases**: 45
- **Total Test Suites**: 8
- **Total Objects**: 67
- **Total Keywords**: 12
- **Last Modified**: 2024-01-15

## Health Metrics
- **Healthy Objects**: 57 (85.1%)
- **Objects with Smart Healing**: 23
- **Duplicate Selectors**: 7

## Recommendations
- Consider enabling smart healing for more objects
- Review and resolve duplicate selectors
- Object repository is in good health

Your project appears to be well-structured with good object health. I recommend enabling smart healing for the remaining objects to improve test resilience.
```

### Example 2: Creating a Login Test Case

```
I need to create a login test case for my e-commerce application. The login page has a username field (id="email"), password field (id="password"), and login button (class="btn-login"). Can you help me create this test case with smart healing enabled?
```

**Expected Claude Response:**
```
I'll create a comprehensive login test case with smart healing enabled for better reliability.

[Uses katalon_create_test_case and katalon_manage_object_repository tools]

✅ Test case "User_Login_Success" created successfully

I've also created the necessary objects in your repository:
- Email input field with smart healing enabled
- Password input field with fallback selectors
- Login button with multiple identification strategies

The test case includes:
1. Navigate to login page
2. Enter valid email
3. Enter valid password
4. Click login button
5. Verify successful login

Each object is configured with smart healing to handle dynamic changes in your application.
```

### Example 3: Executing Test Suites

```
Please execute my regression test suite located at "Test Suites/Regression_Suite.ts" using Chrome browser with the staging environment profile.
```

**Expected Claude Response:**
```
I'll execute your regression test suite with the specified configuration.

[Uses katalon_execute_test_suite tool]

# Katalon Test Execution Report

## Execution Summary
- **Status**: ✅ PASSED
- **Duration**: 127.45 seconds
- **Browser**: Chrome
- **Profile**: staging

## Test Results Summary
- **Total Tests**: 15
- **Passed**: 14
- **Failed**: 1
- **Skipped**: 0

## Individual Test Results
### Login_Valid_Credentials
- **Status**: ✅ PASSED
- **Duration**: 8.32 seconds

### Checkout_Process
- **Status**: ❌ FAILED
- **Duration**: 12.45 seconds
- **Error**: Element not found: checkout_submit_button

### Product_Search
- **Status**: ✅ PASSED
- **Duration**: 6.78 seconds

The test suite completed with one failure in the checkout process. I recommend checking the checkout_submit_button object for potential healing opportunities.
```

### Example 4: Managing Object Repository with Smart Healing

```
The checkout button in my application keeps changing its ID. Can you set up smart healing for this object and configure it to handle dynamic IDs?
```

**Expected Claude Response:**
```
I'll configure smart healing for your checkout button to handle dynamic IDs effectively.

[Uses katalon_manage_object_repository with healing configuration]

✅ Object "checkout_submit_button" updated with smart healing

**Smart Healing Configuration:**
- Primary Strategy: Attribute fallback (ID → Class → Text)
- Secondary Strategy: CSS conversion
- Confidence Threshold: 80%
- Auto-healing: Enabled

**Fallback Selectors Added:**
1. `button[class*="checkout"]` (CSS class-based)
2. `//button[contains(text(), "Complete Order")]` (Text-based)
3. `//div[@class="checkout-section"]//button[1]` (Position-based)

This configuration will automatically try alternative selectors if the primary ID selector fails, ensuring your tests remain stable even when IDs change.
```

### Example 5: Creating Custom Keywords

```
I frequently need to verify that a user is logged in successfully. Can you help me create a custom keyword called "verifyUserLogin" that checks for the presence of a welcome message and user menu?
```

**Expected Claude Response:**
```
I'll create a reusable custom keyword for login verification.

[Uses katalon_manage_keywords tool]

✅ Custom keyword "verifyUserLogin" created successfully

**Generated Code:**
```groovy
/**
 * Verify that user login was successful
 * @param expectedUsername Expected username to verify
 */
def verifyUserLogin(expectedUsername) {
    // Verify welcome message is present
    WebUI.verifyElementPresent(findTestObject('Dashboard/welcome_message'), 10)
    
    // Verify user menu is visible
    WebUI.verifyElementVisible(findTestObject('Navigation/user_menu'))
    
    // Verify username is displayed correctly
    if (expectedUsername) {
        String displayedName = WebUI.getText(findTestObject('Dashboard/username_display'))
        WebUI.verifyMatch(displayedName, expectedUsername, false)
    }
    
    // Log successful verification
    KeywordUtil.logInfo("User login verification completed successfully")
}
```

## Usage in Test Cases:
```groovy
// Simple usage
verifyUserLogin("john.doe@example.com")

// In a test case
WebUI.click(findTestObject('LoginPage/login_button'))
verifyUserLogin(GlobalVariable.testUsername)
```

This keyword provides a comprehensive login verification that you can reuse across all your test cases.
```

### Example 6: Smart Healing Analysis and Recommendations

```
Can you analyze the smart healing effectiveness in my project and provide recommendations for improving test stability?
```

**Expected Claude Response:**
```
I'll analyze your smart healing performance and provide actionable recommendations.

[Uses katalon_manage_object_repository with action: 'heal' and 'analyze']

# Smart Healing Analysis Report

## Healing Performance
- **Total Healing Attempts**: 45
- **Successful Healing**: 38 (84.4%)
- **Failed Healing**: 7 (15.6%)
- **Average Confidence**: 87.3%

## Top Healing Strategies
1. **Attribute Fallback**: 18 successes (47.4%)
2. **XPath Optimization**: 12 successes (31.6%)
3. **CSS Conversion**: 8 successes (21.1%)

## Recent Healing Activity
- ✅ product_search_button: ID → Class fallback (95% confidence)
- ✅ navigation_menu: XPath optimized (88% confidence)
- ❌ dynamic_popup_close: All strategies failed

## Recommendations

### Immediate Actions
1. **Enable Auto-Update**: Your healing success rate is high (84.4%) - consider enabling automatic object updates
2. **Review Failed Objects**: 7 objects consistently fail healing - manual review needed
3. **Optimize Top Strategy**: Attribute fallback is most successful - prioritize stable attributes

### Long-term Improvements
1. **Add Data-TestID Attributes**: Work with developers to add stable test identifiers
2. **Implement Visual Recognition**: For critical elements that resist traditional healing
3. **Regular Health Audits**: Schedule monthly object repository health checks

### Configuration Recommendations
```json
{
  "smartHealing": {
    "enabled": true,
    "confidenceThreshold": 0.85,
    "autoUpdateObjects": true,
    "prioritizeAttributeFallback": true
  }
}
```

Your smart healing system is performing well and significantly improving test stability.
```

## Advanced Usage Patterns

### Multi-Browser Testing
```
Execute my test suite across Chrome, Firefox, and Edge browsers, and compare the results to identify browser-specific issues.
```

### Data-Driven Testing
```
Create a data-driven test for user registration using the test data from "Data Files/UserRegistration.xlsx". Include validation for different user types and error scenarios.
```

### API and UI Integration Testing
```
Create a test that combines API calls to set up test data and UI automation to verify the changes are reflected in the interface.
```

### Mobile Testing Setup
```
Help me set up mobile testing for our Android app. I need to create object repository items and test cases for the mobile login flow.
```

## Troubleshooting

### Common Issues and Solutions

1. **Katalon Runtime Engine Not Found**
   ```
   The MCP server automatically detects Katalon installations. If detection fails, set the KATALON_HOME environment variable.
   ```

2. **Smart Healing Not Working**
   ```
   Check the smart healing configuration in your project settings. Ensure confidence thresholds are appropriately set.
   ```

3. **Object Repository Corruption**
   ```
   Use the object health analysis tool to identify and fix corrupted object definitions.
   ```

## Best Practices

1. **Always Use Smart Healing**: Enable smart healing for all new objects
2. **Regular Health Checks**: Run monthly object repository analysis
3. **Meaningful Object Names**: Use descriptive, action-oriented object names
4. **Custom Keywords**: Create reusable keywords for common operations
5. **Data-Driven Approach**: Use external data sources for comprehensive testing
6. **Continuous Monitoring**: Set up automated health monitoring for your test suite

This MCP server transforms your Katalon testing experience by providing AI-powered insights, recommendations, and automation capabilities that work seamlessly with your existing Katalon Studio and Runtime Engine licenses.
