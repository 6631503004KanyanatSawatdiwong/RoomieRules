# Contributing to RoomieRules

Thank you for considering contributing to RoomieRules! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Basic knowledge of React, Next.js, and TypeScript

### Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/yourusername/RoomieRules.git
   cd RoomieRules
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

### File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   └── [feature]/         # Feature-based routing
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript type definitions
```

### Naming Conventions

- **Files**: Use kebab-case (`user-profile.tsx`)
- **Components**: Use PascalCase (`UserProfile`)
- **Functions**: Use camelCase (`getUserData`)
- **Constants**: Use UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: Use PascalCase (`UserData`, `ApiResponse`)

### Git Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes with clear commits**:
   ```bash
   git commit -m "feat: add user profile editing functionality"
   ```

3. **Follow conventional commit format**:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Build process or auxiliary tool changes

4. **Push your branch and create a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```

## 🧪 Testing

### Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Writing Tests

- Add tests for new features and bug fixes
- Follow existing test patterns
- Include edge cases and error scenarios
- Test both happy path and error conditions

## 📝 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional format

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots here

## Additional Notes
Any additional information or context
```

### Review Process

1. At least one maintainer review required
2. All CI checks must pass
3. Address feedback and update PR
4. Maintainer will merge after approval

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g. iOS, Windows, macOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

**Additional context**
Any other context about the problem
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution you'd like**
A clear description of what you want to happen

**Describe alternatives you've considered**
Other solutions or features you've considered

**Additional context**
Any other context, screenshots, or examples
```

## 🏗 Architecture Decisions

### Adding New Features

1. **Database changes**: Update schema in `src/lib/db.ts`
2. **API endpoints**: Add routes in `src/app/api/`
3. **Types**: Define interfaces in `src/lib/types.ts`
4. **Components**: Create reusable components in `src/components/`
5. **Pages**: Add pages in appropriate `src/app/` directories

### State Management

- Use React Context for global state
- Local state for component-specific data
- Custom hooks for complex state logic

### Styling

- Use Tailwind CSS classes
- Mobile-first responsive design
- 44px minimum touch targets for mobile
- Follow existing color scheme and patterns

## 📚 Learning Resources

### Project Technologies

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Best Practices

- [React Patterns](https://reactpatterns.com/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

## 🆘 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Email**: For security issues or private matters

### Questions

Before asking questions:
1. Check existing issues and discussions
2. Read the documentation
3. Search the codebase for similar implementations

When asking questions:
- Provide context and relevant code
- Include error messages and logs
- Describe what you've already tried

## 🏆 Recognition

### Contributors

All contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors graph

### Types of Contributions

We welcome all types of contributions:
- **Code**: Features, bug fixes, refactoring
- **Documentation**: README, guides, API docs
- **Design**: UI/UX improvements, icons, graphics
- **Testing**: Test cases, bug reports, quality assurance
- **Community**: Answering questions, mentoring newcomers

## 📄 License

By contributing to RoomieRules, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to RoomieRules! 🏠✨
