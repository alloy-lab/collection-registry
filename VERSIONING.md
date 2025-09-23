# 📦 Version Management Guide

This document explains how versioning works in the Collection Registry package.

## 🎯 **Automatic Versioning Strategy**

The package uses **Conventional Commits** + **Automatic Versioning** based on commit messages.

### **Version Bump Rules**

| Commit Type                                               | Version Bump              | Example                                       |
| --------------------------------------------------------- | ------------------------- | --------------------------------------------- |
| `feat(scope):`                                            | **Minor** (1.0.0 → 1.1.0) | `feat(types): add support for nested objects` |
| `fix(scope):`                                             | **Patch** (1.0.0 → 1.0.1) | `fix(cli): resolve path resolution issue`     |
| `feat!(scope):` or `BREAKING CHANGE:`                     | **Major** (1.0.0 → 2.0.0) | `feat!(api): change client method signatures` |
| `docs(scope):`, `style(scope):`, `refactor(scope):`, etc. | **Patch** (1.0.0 → 1.0.1) | `docs(readme): update installation guide`     |

### **Commit Message Format**

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Examples:**

```bash
feat(types): add support for nested object types
fix(cli): resolve path resolution issue in Windows
docs(readme): update installation instructions
chore(deps): update dependencies to latest versions
feat!(api): change client method signatures

BREAKING CHANGE: The `getCollection` method now returns a Promise
```

## 🔄 **How It Works**

### **1. Development Workflow**

1. **Make changes** to the code
2. **Commit with conventional format:**
   ```bash
   git commit -m "feat(types): add support for nested objects"
   ```
3. **Push to main branch:**
   ```bash
   git push origin main
   ```

### **2. Automatic Process**

1. **GitHub Actions** detects the push
2. **Runs tests** and quality checks
3. **Analyzes commit message** to determine version bump
4. **Increments version** in `package.json`
5. **Creates git tag** (e.g., `v1.1.0`)
6. **Publishes to npm** automatically
7. **Updates CHANGELOG.md** (if configured)

### **3. Manual Override**

If you need to manually control versioning:

```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor

# Major version (breaking changes)
npm version major
```

## 📋 **Commit Types & Scopes**

### **Types**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting previous commits

### **Scopes**

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

## 🚀 **Release Process**

### **Automatic Releases**

- **Triggered by:** Push to `main` branch
- **Version bump:** Based on commit message
- **Publishing:** Automatic to npm
- **Tagging:** Automatic git tags

### **Manual Releases**

```bash
# 1. Make sure you're on main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Run tests locally
pnpm test:run

# 4. Bump version manually
npm version patch  # or minor/major

# 5. Push changes and tags
git push origin main
git push origin --tags
```

## 🔍 **Checking Current Version**

```bash
# Check package.json version
cat package.json | grep version

# Check latest git tag
git describe --tags --abbrev=0

# Check npm published version
npm view @alloylab/collection-registry version
```

## ⚠️ **Important Notes**

1. **Always use conventional commits** - the system depends on them
2. **Test locally** before pushing to main
3. **Breaking changes** should use `feat!` or include `BREAKING CHANGE:` in footer
4. **Version tags** are created automatically - don't create them manually
5. **npm publishing** happens automatically after successful tests

## 🛠️ **Troubleshooting**

### **Version Not Bumping**

- Check if commit message follows conventional format
- Verify you're pushing to `main` branch
- Check GitHub Actions logs for errors

### **Publishing Failed**

- Verify `NPM_TOKEN` secret is set in GitHub
- Check if version already exists on npm
- Review GitHub Actions logs for specific errors

### **Wrong Version Bump**

- Use manual versioning for corrections
- Create a new commit with correct conventional format
- Or use `npm version` commands directly
