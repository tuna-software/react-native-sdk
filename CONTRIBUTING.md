# Contributing to Tuna React Native SDK

Thank you for your interest in contributing to the Tuna React Native SDK! We welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/react-native-sdk.git
   cd react-native-sdk
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the example app:
   ```bash
   cd example/TunaPaymentDemo
   npm install
   npx react-native run-android  # or run-ios
   ```

## 🛠️ Development Workflow

### Building

```bash
npm run build          # Build for production
npm run build:dev      # Build with watch mode
```

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Code Quality

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors
npm run format        # Format code with Prettier
npm run typecheck     # Check TypeScript types
```

## 📝 Coding Standards

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use camelCase for variables and functions, PascalCase for classes and interfaces
- **Comments**: Document complex logic and public APIs

### Code Style Example

```typescript
interface PaymentConfig {
  amount: number;
  currency: string;
  customerId?: string;
}

/**
 * Process a payment with the given configuration
 * @param config - Payment configuration object
 * @returns Promise resolving to payment result
 */
export async function processPayment(config: PaymentConfig): Promise<PaymentResult> {
  // Implementation here
}
```

## 🐛 Bug Reports

When filing a bug report, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected behavior** vs actual behavior
4. **Environment details**:
   - React Native version
   - iOS/Android version
   - Device model
   - SDK version
5. **Code sample** or minimal reproduction case
6. **Screenshots** if applicable

## ✨ Feature Requests

For feature requests, please:

1. **Search existing issues** to avoid duplicates
2. **Describe the use case** and why it's needed
3. **Provide examples** of how the API should work
4. **Consider backward compatibility**

## 🔀 Pull Requests

### Before Submitting

1. **Create an issue** first to discuss the change
2. **Fork the repository** and create a feature branch
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Ensure all tests pass**
6. **Follow the existing code style**

### PR Guidelines

1. **Clear title** describing the change
2. **Detailed description** explaining the motivation and implementation
3. **Link to related issues**
4. **Include breaking changes** in the description if any
5. **Add screenshots** for UI changes
6. **Keep PRs focused** - one feature/fix per PR

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Example app tested

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## 📱 Platform-Specific Guidelines

### iOS Development
- Test on multiple iOS versions (iOS 11+)
- Follow Apple's design guidelines
- Ensure Apple Pay compliance
- Test on both simulator and physical devices

### Android Development
- Test on multiple Android versions (API 21+)
- Follow Material Design guidelines
- Ensure Google Pay compliance
- Test on various screen sizes and densities

## 🔐 Security

- **Never commit** sensitive data (API keys, credentials)
- **Follow PCI compliance** guidelines for payment data
- **Use secure communication** (HTTPS only)
- **Report security issues** privately to security@tuna.uy

## 📋 Release Process

1. **Version bump** in package.json
2. **Update CHANGELOG.md**
3. **Create release PR**
4. **Tag release** after merge
5. **Publish to npm**

## 💬 Community

- **GitHub Issues**: For bugs and feature requests
- **Discord**: [Tuna Community](https://discord.gg/tuna) for discussions
- **Email**: developers@tuna.uy for questions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉