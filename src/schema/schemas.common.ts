import z from "zod/v4";

// Discord ID validation - 18-20 digit string or placeholder for special values
const discordIdSchema = z.string().regex(/^\d{18,20}$/, 'Invalid Discord ID');

// Discord ID or creator placeholder
const discordIdOrPlaceholderSchema = z.union([
  discordIdSchema,
  z.literal('{{creatorId}}'),
]);

const discordIdOrPlaceholderOrEveryone = z.union([
  discordIdSchema,
  z.literal('{{creatorId}}'),
  z.literal('@everyone'),
]);

type DiscordId = z.infer<typeof discordIdSchema>;
type DiscordIdOrPlaceholder = z.infer<typeof discordIdOrPlaceholderSchema>;
type DiscordIdOrPlaceholderOrEveryone = z.infer<typeof discordIdOrPlaceholderOrEveryone>;

export {
  discordIdSchema,
  discordIdOrPlaceholderSchema,
  discordIdOrPlaceholderOrEveryone,
  type DiscordId,
  type DiscordIdOrPlaceholder,
  type DiscordIdOrPlaceholderOrEveryone,
}