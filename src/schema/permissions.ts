import { PermissionFlagsBits } from "discord.js";
import z from "zod/v4";
import { discordIdOrPlaceholderOrEveryone } from "./schemas.common";

// Permission name to bigint mapping
const permissionBitMap: Record<string, bigint> = Object.entries(PermissionFlagsBits)
  .filter(([, value]) => typeof value === 'bigint')
  .reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, bigint>,
  );

// Valid permission names
const validPermissionNames = Object.keys(permissionBitMap);

// Base permission enum (for display/JSON schema)
const permissionNameEnum = z.enum(validPermissionNames as [string, ...string[]]);

// Helper to create channel permission schema with different permission types
const createChannelPermissionSchema = <T extends z.ZodTypeAny>(permSchema: T) => 
  z.object({
    roleId: discordIdOrPlaceholderOrEveryone.describe('Role ID, {{creatorId}} placeholder, or @everyone'),
    allow: z
      .array(permSchema)
      .describe(`Allowed permission names (e.g., "Connect", "Speak", "ViewChannel")`),
    deny: z
      .array(permSchema)
      .describe(`Denied permission names (e.g., "Connect", "Speak", "ViewChannel")`),
  })
  .refine(
    (perm) => {
      // Check that no permission appears in both allow and deny
      const allowSet = new Set(perm.allow);
      const denySet = new Set(perm.deny);
      return Array.from(allowSet).every(p => !denySet.has(p));
    },
    {
      message: 'A permission cannot appear in both allow and deny lists',
      path: ['allow'],
    },
  );

// No-transform version (keeps strings) - for parsing and storage
const channelPermissionDisplaySchema = createChannelPermissionSchema(permissionNameEnum);

// Transform version (converts to BigInts) - for Discord API use
const permissionNameSchema = permissionNameEnum.transform((name) => permissionBitMap[name]);
const channelPermissionSchema = createChannelPermissionSchema(permissionNameSchema);

type PermissionName = z.infer<typeof permissionNameSchema>;
type ChannelPermission = z.infer<typeof channelPermissionSchema>;
type ChannelPermissionDisplay = z.infer<typeof channelPermissionDisplaySchema>;

export {
  channelPermissionSchema,
  channelPermissionDisplaySchema,
  permissionNameSchema,
  permissionNameEnum,
  permissionBitMap,
  type PermissionName,
  type ChannelPermission,
  type ChannelPermissionDisplay,
}