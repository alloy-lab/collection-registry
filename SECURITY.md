# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT create a public issue

**Do not** create a public GitHub issue for security vulnerabilities. This could put other users at risk.

### 2. Report privately

Please report security vulnerabilities privately by:

- **Email**: Send details to [security@alloylab.net](mailto:security@alloylab.net)
- **GitHub Security Advisories**: Use GitHub's private vulnerability reporting feature

### 3. Include the following information

When reporting a vulnerability, please include:

- **Description**: A clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: What systems or data could be affected
- **Suggested Fix**: If you have ideas for how to fix the issue
- **Your Contact Information**: How we can reach you for follow-up

### 4. Response Timeline

We will:

- **Acknowledge** your report within 48 hours
- **Investigate** the vulnerability within 7 days
- **Provide updates** on our progress
- **Release a fix** as soon as possible (typically within 30 days)
- **Credit** you in our security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

- **Keep Updated**: Always use the latest version of the Collection Registry
- **Review Generated Code**: Review generated code before using in production
- **Validate Inputs**: Validate all inputs to your Payload CMS collections
- **Secure Configuration**: Use secure configuration for your Payload CMS
- **Regular Audits**: Regularly audit your dependencies and generated code

### For Developers

- **Input Validation**: Always validate inputs from Payload collections
- **Sanitization**: Sanitize any user-provided data
- **Dependencies**: Keep dependencies updated and audit for vulnerabilities
- **Code Review**: Review all generated code before deployment
- **Testing**: Test security-related functionality thoroughly

## Security Considerations

### File System Access

The Collection Registry reads from and writes to the file system. Ensure:

- Proper file permissions are set
- Input paths are validated
- No sensitive files are exposed

### Code Generation

Generated code should be:

- Reviewed before use in production
- Tested thoroughly
- Free from security vulnerabilities
- Following security best practices

### Dependencies

We regularly audit our dependencies for security vulnerabilities:

- All dependencies are kept up to date
- Security vulnerabilities are patched promptly
- We use tools like `npm audit` to check for issues

## Security Tools

We use the following tools to maintain security:

- **npm audit**: Regular dependency vulnerability scanning
- **ESLint security rules**: Code analysis for security issues
- **TypeScript**: Type safety to prevent common vulnerabilities
- **Automated testing**: Security-focused test cases

## Disclosure Policy

When we receive a security vulnerability report:

1. **Private Investigation**: We investigate the issue privately
2. **Fix Development**: We develop a fix without public disclosure
3. **Testing**: We thoroughly test the fix
4. **Release**: We release the fix in a new version
5. **Public Disclosure**: We publish a security advisory after the fix is available

## Security Updates

Security updates will be:

- Released as soon as possible
- Clearly marked as security fixes
- Documented in our security advisories
- Backported to supported versions when possible

## Contact

For security-related questions or concerns:

- **Email**: [security@alloylab.net](mailto:security@alloylab.net)
- **GitHub**: Use GitHub's private vulnerability reporting

## Acknowledgments

We thank all security researchers who responsibly disclose vulnerabilities. Contributors will be credited in our security advisories unless they prefer to remain anonymous.

---

**Thank you for helping keep the Collection Registry secure! 🔒**
