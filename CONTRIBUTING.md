# Contributing to Collection Registry

Thank you for your interest in contributing to the Collection Registry! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Git
- Basic understanding of TypeScript and Payload CMS

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/collection-registry.git
   cd collection-registry
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Install Git Hooks**

   ```bash
   pnpm hooks:install
   ```

4. **Build the Package**

   ```bash
   pnpm build
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Follow Prettier configuration
- **Linting**: Follow ESLint rules
- **Naming**: Use descriptive, camelCase names
- **Comments**: Add JSDoc comments for public APIs

### Project Structure

```
src/
├── bin.ts                    # CLI entry point
├── collectionRegistry.ts     # Main registry class
├── generators/               # Code generation modules
│   └── types.ts
├── utils/                    # Utility functions
│   ├── fieldAnalyzer.ts
│   └── templateEngine.ts
└── __tests__/               # Test files
    └── collectionRegistry.test.ts
```

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/) for automatic versioning:

```bash
<type>(<scope>): <description>

# Examples:
feat(types): add support for nested object types
fix(cli): resolve path resolution issue
docs(readme): update installation guide
chore(deps): update dependencies
```

**Types:**

- `feat`: New features (triggers minor version bump)
- `fix`: Bug fixes (triggers patch version bump)
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

**Scopes:**

- `core`: Core functionality
- `cli`: CLI tool
- `types`: Type generation
- `routes`: Route generation
- `api`: API client generation
- `docs`: Documentation
- `deps`: Dependencies
- `config`: Configuration
- `ci`: CI/CD
- `release`: Release process

### Adding Features

#### New Type Generators

1. Create generator in `src/generators/`
2. Add to the main registry class
3. Add tests for the generator
4. Update documentation

Example:

```typescript
// src/generators/customTypes.ts
export class CustomTypeGenerator {
  generate(collection: CollectionConfig): string {
    // Implementation
  }
}
```

#### New CLI Options

1. Add option to `src/bin.ts`
2. Update the main registry class to handle the option
3. Add tests for the new option
4. Update documentation

#### New Utility Functions

1. Add function to appropriate utility file
2. Add JSDoc comments
3. Add tests
4. Export from the main module

### Testing

- **Unit Tests**: Add tests for utility functions and generators
- **Integration Tests**: Test the full generation pipeline
- **CLI Tests**: Test command-line interface
- **Type Checking**: Ensure TypeScript compiles without errors

```bash
# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix
```

### Code Quality

Before submitting a PR, ensure:

- [ ] All tests pass
- [ ] Code is properly typed
- [ ] ESLint passes without errors
- [ ] Prettier formatting is applied
- [ ] JSDoc comments are added for public APIs
- [ ] Commit messages follow conventional format

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: OS, Node.js version, package versions
6. **Collection Example**: Minimal example of the collection causing the issue

Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml) when creating issues.

## ✨ Feature Requests

When requesting features, please include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml) when creating issues.

## 🔄 Pull Request Process

### Before Submitting

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** your changes thoroughly
5. **Commit** with conventional format: `git commit -m 'feat(types): add amazing feature'`
6. **Push** to your fork: `git push origin feature/amazing-feature`

### Pull Request Guidelines

1. **Title**: Use a clear, descriptive title
2. **Description**: Explain what changes you made and why
3. **Testing**: Describe how you tested the changes
4. **Breaking Changes**: Note any breaking changes
5. **Documentation**: Update documentation if needed

Use the [Pull Request Template](.github/pull_request_template.md) when creating PRs.

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: Maintainers review the code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, the PR will be merged

## 📚 Documentation

### Updating Documentation

- **README**: Update for new features or setup changes
- **API Docs**: Document new APIs and options
- **Code Comments**: Add JSDoc comments for public APIs
- **Examples**: Provide usage examples for new features

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Use proper markdown formatting

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/) with automatic versioning based on commit messages:

- **MAJOR**: Breaking changes (`feat!:` or `BREAKING CHANGE:`)
- **MINOR**: New features (`feat:`)
- **PATCH**: Bug fixes (`fix:`) and other changes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version is bumped automatically
- [ ] Package is published to npm

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different opinions and approaches

### Communication

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Pull Requests**: Use PR comments for code review discussions

## 🛠️ Development Tools

### Recommended VS Code Extensions

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- GitLens
- Jest

### Useful Commands

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Format code
pnpm format

# Install git hooks
pnpm hooks:install

# Uninstall git hooks
pnpm hooks:uninstall
```

## 📞 Getting Help

- **Documentation**: Check the README and inline comments
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub discussions for questions
- **Community**: Join our community discussions

## 🙏 Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to the Collection Registry! 🎉
