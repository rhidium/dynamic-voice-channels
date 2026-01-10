import { z } from 'zod/v4';
import { discordIdSchema } from './schemas.common';
import { channelPermissionDisplaySchema } from './permissions';
import { DiscordConstants } from 'rhidium/core/constants/discord';

// Helper to create click-to-create config schema
const createClickToCreateConfigSchema = <T extends z.ZodTypeAny>(permSchema: T) => z.object({
  channelId: discordIdSchema.describe('The channel ID that triggers VC creation when joined'),
  categoryId: discordIdSchema.describe('The category where new VCs will be created. Any voice-channels in this category are considered dynamic channels. When a dynamic channel is empty, it will be deleted.'),
  maxChannels: z.number().int().positive().max(DiscordConstants.MAX_CHANNELS_PER_CATEGORY).describe('Maximum number of channels that can be created'),
  channelName: z.string().min(1).describe('Channel name format ({creator} will be replaced)'),
  channelUserLimit: z.number().int().nonnegative().max(DiscordConstants.MAX_USERS_PER_VOICE_CHANNEL_VERIFIED_COMMUNITY_OR_PARTNER).describe('User limit for created channels (0 = unlimited)'),
  channelBitrate: z.number().int().positive().describe('Bitrate in Hz for created channels'),
  channelPermissions: z
    .array(permSchema)
    .min(1)
    .describe('Permission overrides for created channels'),
}).describe('Click-to-create configuration');

// Main schema: uses display version (no-transform) - keeps permissions as strings
const clickToCreateConfigSchema = createClickToCreateConfigSchema(channelPermissionDisplaySchema);

// Root schema for all click-to-create configurations
const clickToCreateSchema = z.array(clickToCreateConfigSchema).describe('Array of click-to-create configurations');

// Type exports for TypeScript
type ClickToCreateConfig = z.infer<typeof clickToCreateConfigSchema>;
type ClickToCreate = z.infer<typeof clickToCreateSchema>;

export {
  clickToCreateSchema,
  clickToCreateConfigSchema,
  type ClickToCreate,
  type ClickToCreateConfig,
}