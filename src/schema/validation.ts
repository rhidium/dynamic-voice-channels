import { type ClickToCreate } from './schemas';

/**
 * Validates click-to-create configurations with cross-config rules
 * @throws Error with details about validation failures
 */
export function validateClickToCreateConfig(config: ClickToCreate): void {
  const errors: string[] = [];

  // Check for duplicate channelIds
  const channelIds = new Map<string, number>();
  config.forEach((cfg, index) => {
    if (channelIds.has(cfg.channelId)) {
      errors.push(`Config[${index}]: channelId "${cfg.channelId}" is duplicated (also appears in config[${channelIds.get(cfg.channelId)}])`);
    } else {
      channelIds.set(cfg.channelId, index);
    }
  });

  // Check for duplicate categoryIds
  const categoryIds = new Map<string, number>();
  config.forEach((cfg, index) => {
    if (categoryIds.has(cfg.categoryId)) {
      errors.push(`Config[${index}]: categoryId "${cfg.categoryId}" is duplicated (also appears in config[${categoryIds.get(cfg.categoryId)}])`);
    } else {
      categoryIds.set(cfg.categoryId, index);
    }
  });

  // Check for permission overlaps (allow and deny)
  config.forEach((cfg, cfgIndex) => {
    cfg.channelPermissions.forEach((perm, permIndex) => {
      const allowSet = new Set(perm.allow);
      const denySet = new Set(perm.deny);
      const roleIdLabel = Array.isArray(perm.roleId) ? perm.roleId.join(', ') : perm.roleId;
      
      const overlaps = Array.from(allowSet).filter(p => denySet.has(p));
      if (overlaps.length > 0) {
        errors.push(
          `Config[${cfgIndex}].channelPermissions[${permIndex}] (roleId: "${roleIdLabel}"): ` +
          `Permission(s) "${overlaps.join('", "')}" cannot be in both allow and deny lists`
        );
      }
    });
  });

  if (errors.length > 0) {
    throw new Error(`Click-to-Create configuration validation failed:\n${errors.join('\n')}`);
  }
}
