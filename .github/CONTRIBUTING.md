# Contribution Guidelines

The following information is for people looking to contribute to the project.

## Project Structure

```
├── config/                 # Bot configuration files
│   ├── config.json        # Discord bot credentials
│   ├── extended-config.json  # Extended Rhidium config
│   └── click-to-create.yaml  # Voice channel triggers
├── locales/               # i18n translation files
│   ├── en-US/            # English translations
│   └── nl/               # Dutch translations
├── prisma/               # Database schema and migrations
│   ├── schemas/          # Prisma schema files
│   └── migrations/       # Database migrations
├── src/                  # Application source code
│   ├── index.ts         # Entry point
│   ├── config.ts        # Config loader
│   ├── registry/        # Event listeners
│   ├── schema/          # Validation & schemas
│   └── voice-state/     # Voice channel logic
├── rhidium/             # Git submodule (framework)
├── docker/              # Docker (compose) configuration
│   ├── compose.yaml     # Docker Compose orchestration
│   ├── Dockerfile       # Multi-stage build config
│   └── entrypoint.sh    # Docker startup script
├── Makefile             # Common command shortcuts
```

## Tools & Frameworks

- [Rhidium](https://github.com/rhidium/rhidium) - Discord bot framework with built-in features
- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Prisma](https://www.prisma.io/) - Type-safe database ORM
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [tsdown](https://tsdown.netlify.app/) - TypeScript bundler and build tool
- [tsx](https://tsx.is/) - TypeScript execution and hot reload

## Development Guidelines

- Follow existing code style and patterns
- Add tests for new features
- Update documentation for any configuration changes
- Test with Docker Compose before submitting
- Ensure `pnpm typecheck` passes

## Development Commands

```bash
# Start dev server with hot reload
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm typecheck

# Clean build artifacts
pnpm clean

# Clean everything (including node_modules)
pnpm clean:full

# Copy locales from rhidium
pnpm cp:locales

# Generate JSON schema from YAML config
pnpm gen:schema

# Update dependencies (minor)
pnpm up:bump:minor

# Update dependencies (major)
pnpm up:bump:major
```

## Useful Commands

- Generate a new (default) `tsconfig.json` file: `npx -p typescript tsc --init`
- Apply `verbatimModuleSyntax` fixes: `pnpm dlx fix-verbatim-module-syntax --dry ./tsconfig.json`
- Check for circular dependencies: Review build output from `pnpm build`

## Building & Testing

The build process uses `tsdown` with these features:
- CommonJS output format
- Source maps for debugging
- Circular dependency detection
- External dependencies (no bundling)
- Separate build configs for app and Prisma generated code

## Git Submodules

This project uses git submodules to manage the Rhidium framework. Submodules allow us to include and track specific versions of external repositories while keeping the main repository clean.

### Quick Reference

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/rhidium/dynamic-voice-channels.git

# If already cloned without submodules
git submodule update --init --recursive

# Pull latest changes (main repo + submodules)
git pull && git submodule update --remote --merge

# Update submodules to tracked commits
git submodule update --recursive

# Add new submodules
git submodule add <repo-url> <directory-name>
```

### Working with Submodules

The `rhidium/` directory is a git submodule pointing to the Rhidium framework. When you make changes to the submodule:

1. Commit changes in the submodule directory
2. Return to the main repo and commit the submodule pointer update
3. Push both repositories
