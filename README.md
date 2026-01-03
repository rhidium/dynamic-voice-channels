# Rhidium/dynamic-voice-channels

...

## Development

### Tools & Frameworks

- [tsx](https://tsx.is/) for ...

### Commands

- Generate a new (default) `tsconfig.json` file: `npx -p typescript tsc --init`
- Apply `verbatimModuleSyntax` fixes: `pnpm dlx fix-verbatim-module-syntax --dry ./tsconfig.json`

> Note: Please keep reading to learn more about **git submodules** in use by this repository.

## Git Submodules

This project uses git submodules to manage external dependencies. Submodules allow us to include and track specific versions of external repositories while keeping the main repository clean.

### Quick Reference

```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>

# If already cloned without submodules
git submodule update --init --recursive

# Pull latest changes (main repo + submodules)
git pull && git submodule update --remote --merge

# Update submodules to tracked commits
git submodule update --recursive

# Add submodules
git submodule add <repo-url> <lib-name>
```
