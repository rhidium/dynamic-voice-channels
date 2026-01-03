# Rhidium/dynamic-voice-channels

...

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
