import { ChannelType, GuildMember, VoiceChannel, type VoiceBasedChannel } from 'discord.js';
import { toDiscordPermissionOverwrite } from '../schema/permissions-utils';
import { type ClickToCreateConfig } from '../schema/schemas';
import { Logger } from '../logger';
import type Client from 'rhidium/core/client';
import { prisma } from './prisma';

export async function kickMemberFromChannel(
  member: GuildMember
): Promise<void> {
  const channel = member.voice.channel;

  if (!channel) {
    Logger.warn(`Member ${member.id} is not in a voice channel to kick from.`);
    return;
  }

  if (member && member.voice.channelId === channel.id) {
    await member.voice.disconnect('Kicked from dynamic voice channel');
    Logger.info(`Kicked member ${member.id} from channel ${channel.id}`);
  }
}

/**
 * Creates a new voice channel based on the click-to-create config
 */
export async function createVoiceChannel(
  config: ClickToCreateConfig,
  member: GuildMember,
): Promise<VoiceChannel | null> {
  const guild = member.guild;
  const creatorId = member.id;
  const creatorUsername = member.user.username;

  try {
    // Check if we've reached maxChannels for this trigger
    const existingCount = await prisma.dynamicVoiceChannel.count({
      where: { triggerChannelId: config.channelId }
    });

    // Handle maxChannels limit
    if (existingCount >= config.maxChannels) {
      Logger.warn(`Max channels (${config.maxChannels}) reached for trigger ${config.channelId}`);
      await kickMemberFromChannel(member)
      return null;
    }

    // Replace {creator} placeholder in channel name
    const channelName = config.channelName.replace(/\{creator\}/gi, creatorUsername);

    // Build permission overwrites, replacing {{creatorId}} with actual creator
    const permissionOverwrites = config.channelPermissions.flatMap(perm => {
      const targetRoleIds = Array.isArray(perm.roleId) ? perm.roleId : [perm.roleId];
      const filteredRoleIds = targetRoleIds.filter(id => guild.roles.cache.has(id) || id === '{{creatorId}}' || id === '@everyone');
      const { allow, deny } = toDiscordPermissionOverwrite(perm);

      if (targetRoleIds.length !== filteredRoleIds.length) {
        Logger.warn(`Some role IDs in channelPermissions for trigger ${config.channelId} do not exist in guild ${guild.id} and will be ignored.`);
      }

      return filteredRoleIds.map(roleId => {
        const resolvedRoleId = roleId === '{{creatorId}}'
          ? creatorId
          : roleId === '@everyone'
          ? guild.id
          : roleId;

        return {
          id: resolvedRoleId,
          allow,
          deny,
        };
      });
    });

    // Create the channel
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: config.categoryId,
      userLimit: config.channelUserLimit,
      bitrate: config.channelBitrate,
      permissionOverwrites,
    });

    // Store in database for persistence
    await prisma.dynamicVoiceChannel.create({
      data: {
        channelId: channel.id,
        triggerChannelId: config.channelId,
        categoryId: config.categoryId,
        creatorId,
        guildId: guild.id,
      },
    });

    Logger.info(`Created voice channel ${channel.id} (${channelName}) for creator ${creatorId}`);
    return channel;
  } catch (error) {
    Logger.error(`Failed to create voice channel for creator ${creatorId}:`, error);
    return null;
  }
}

/**
 * Deletes a voice channel and removes it from the database
 */
export async function deleteVoiceChannel(
  client: Client<true>,
  channelId: string
): Promise<void> {
  try {
    // Check if this is a managed dynamic channel
    const record = await prisma.dynamicVoiceChannel.findUnique({
      where: { channelId },
    });

    if (!record) {
      return; // Not a managed channel
    }

    // Delete from Discord
    const guild = client.guilds.cache.get(record.guildId);
    const channel = guild?.channels.cache.get(channelId);
    if (channel) {
      await channel.delete('Dynamic voice channel cleanup - channel empty');
    }

    // Delete from database
    await prisma.dynamicVoiceChannel.delete({
      where: { channelId },
    });

    Logger.info(`Deleted dynamic voice channel ${channelId}`);
  } catch (error) {
    Logger.error(`Failed to delete voice channel ${channelId}:`, error);
  }
}

/**
 * Check if a channel is empty and should be deleted
 */
export function shouldDeleteChannel(channel: VoiceBasedChannel): boolean {
  return channel.members.size === 0;
}

/**
 * Get the creator of a dynamic voice channel
 */
export async function getChannelCreator(channelId: string): Promise<string | null> {
  const record = await prisma.dynamicVoiceChannel.findUnique({
    where: { channelId },
    select: { creatorId: true },
  });
  return record?.creatorId ?? null;
}

/**
 * Check if a channel is a managed dynamic voice channel
 */
export async function isDynamicChannel(channelId: string): Promise<boolean> {
  const count = await prisma.dynamicVoiceChannel.count({
    where: { channelId },
  });
  return count > 0;
}

/**
 * Cleanup orphaned channels on startup
 * Reconciles database state with actual Discord state
 */
export async function reconcileDynamicChannels(client: Client<true>): Promise<void> {
  Logger.info('Reconciling dynamic voice channels...');
  
  const records = await prisma.dynamicVoiceChannel.findMany();
  let deletedCount = 0;

  for (const record of records) {
    try {
      const guild = await client.guilds.fetch(record.guildId).catch(() => null);
      if (!guild) {
        // Guild no longer accessible
        await prisma.dynamicVoiceChannel.delete({ where: { channelId: record.channelId } });
        deletedCount++;
        continue;
      }

      const channel = await guild.channels.fetch(record.channelId).catch(() => null);
      if (!channel) {
        // Channel no longer exists
        await prisma.dynamicVoiceChannel.delete({ where: { channelId: record.channelId } });
        deletedCount++;
        continue;
      }

      // Check if channel is empty and should be cleaned up
      if (channel.isVoiceBased() && channel.members.size === 0) {
        await deleteVoiceChannel(client, record.channelId);
        deletedCount++;
      }
    } catch (error) {
      Logger.error(`Error reconciling channel ${record.channelId}:`, error);
    }
  }

  Logger.info(`Reconciliation complete. Cleaned up ${deletedCount} orphaned channels.`);
}
