import { permissionBitMap } from './permissions';
import type { ClickToCreate, ClickToCreateConfig } from './schemas';

/**
 * Convert permission names (strings) to Discord API BigInt permission flags
 */
export function permissionNamesToBigints(names: string[]): bigint[] {
  return names.map(name => {
    const bit = permissionBitMap[name];
    if (bit === undefined) {
      throw new Error(`Invalid permission name: "${name}"`);
    }
    return bit;
  });
}

/**
 * Transform a single permission object's names to BigInts
 * Useful for passing to Discord.js channel permission overwrites
 */
export function toDiscordPermissionOverwrite(permission: {
  allow: string[];
  deny: string[];
}) {
  return {
    allow: permissionNamesToBigints(permission.allow),
    deny: permissionNamesToBigints(permission.deny),
  };
}

/**
 * Transform an entire config's permissions to BigInts
 */
export function toDiscordClickToCreateConfig(config: ClickToCreateConfig) {
  return {
    ...config,
    channelPermissions: config.channelPermissions.map(perm => ({
      roleId: perm.roleId,
      ...toDiscordPermissionOverwrite(perm),
    })),
  };
}

/**
 * Transform all configs' permissions to BigInts
 */
export function toDiscordClickToCreateConfigs(configs: ClickToCreate) {
  return configs.map(toDiscordClickToCreateConfig);
}
