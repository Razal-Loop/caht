# Contributing to AnonChat

Thank you for your interest in contributing to AnonChat! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce the bug
- Provide system information (OS, browser, Node.js version)
- Include screenshots if applicable

### Suggesting Features
- Check existing issues first
- Provide a clear description of the feature
- Explain the use case and benefits
- Consider implementation complexity

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/yourusername/anonchat.git
cd anonchat

# Install dependencies
npm run install-all

# Start development server
npm run dev
```

### Project Structure
- `/client` - React frontend
- `/server` - Node.js backend
- `/docs` - Documentation

## 📝 Coding Standards

### JavaScript/React
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Add PropTypes for component props
- Use meaningful variable names

### CSS
- Use CSS modules or styled-components
- Follow BEM methodology
- Mobile-first responsive design
- Use CSS custom properties for theming

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Add comments for complex logic
- Keep functions small and focused

## 🧪 Testing

### Manual Testing
- Test on multiple browsers
- Test responsive design
- Test all user flows
- Test error scenarios

### Automated Testing
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No console errors
- [ ] Responsive design works

### PR Description
- Clear title describing the change
- Detailed description of changes
- Screenshots for UI changes
- Link to related issues

### Review Process
- All PRs require review
- Address feedback promptly
- Keep PRs focused and small
- Update documentation as needed

## 🐛 Bug Reports

### Required Information
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/videos if applicable

### Bug Report Template
```markdown
**Bug Description**
Brief description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js: [e.g. 16.14.0]

**Additional Context**
Any other relevant information
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other relevant information
```

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples
- Update README for new features

### API Documentation
- Document all endpoints
- Include request/response examples
- Document error codes
- Keep up to date with changes

## 🔒 Security

### Security Guidelines
- Never commit secrets or API keys
- Validate all user inputs
- Use HTTPS in production
- Follow OWASP guidelines
- Report security issues privately

### Reporting Security Issues
- Email security issues to: security@anonchat.com
- Do not create public issues for security problems
- Include detailed reproduction steps
- Allow time for response before disclosure

## 🎯 Development Priorities

### High Priority
- Bug fixes
- Security improvements
- Performance optimizations
- Accessibility improvements

### Medium Priority
- New features
- UI/UX improvements
- Documentation updates
- Code refactoring

### Low Priority
- Nice-to-have features
- Experimental features
- Code style improvements

## 📞 Getting Help

### Community
- GitHub Discussions for questions
- Discord server for real-time chat
- Stack Overflow with `anonchat` tag

### Maintainers
- @maintainer1 - Core development
- @maintainer2 - Frontend focus
- @maintainer3 - Backend focus

## 🏆 Recognition

### Contributors
- All contributors are listed in CONTRIBUTORS.md
- Significant contributors get maintainer status
- Regular contributors get special badges

### Types of Contributions
- Code contributions
- Documentation improvements
- Bug reports
- Feature suggestions
- Community support

## 📄 License

By contributing to AnonChat, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Thank you for contributing to AnonChat! Your contributions help make anonymous chat accessible to everyone worldwide.

---

*Happy coding! 🚀*
