import { ClientEventListener } from "rhidium/core/commands/events";

import { loadClickToCreateConfig } from "../../config";
import { Logger } from "../../logger";
import { isGuildAvailable, isGuildEvent, resolveChannel, resolveEvent, shouldHandleEvent } from "../../voice-state/checks";
import { createVoiceChannel, deleteVoiceChannel, isDynamicChannel, shouldDeleteChannel } from "../../voice-state/service";
import type { GuildMember, VoiceBasedChannel } from "discord.js";
import type { ClickToCreateConfig } from "../../schema/schemas";
import Client from "rhidium/core/client";

/**
 * @throws Error if configuration loading fails
 */
const config = loadClickToCreateConfig(
  (cfg) => Logger.info(`Loaded click-to-create configuration: ${JSON.stringify(cfg, null, 2)}`)
);

const handleJoin = async (client: Client<true>, member: GuildMember, cfg: ClickToCreateConfig) => {
  // User joined a trigger channel - create their personal VC
  const channel = await createVoiceChannel(cfg, member);

  if (channel) {
    // Move the user to their new channel
    try {
      await member.voice.setChannel(channel.id);
      Logger.info(`Moved ${member.user.tag} to their new voice channel ${channel.id}`);
    } catch (error) {
      Logger.error(`Failed to move ${member.user.tag} to new channel:`, error);
      // If we can't move them, delete the channel we just created
      await deleteVoiceChannel(client, channel.id);
    }
  }
};

const handleLeave = async (client: Client<true>, channel: VoiceBasedChannel, member: GuildMember) => {
  // Check if the channel they left is a dynamic channel
  if (!await isDynamicChannel(channel.id)) {
    return;
  }

  // Fetch the channel to check if it's empty
  const fetchedChannel = await member.guild.channels.fetch(channel.id);
  if (!fetchedChannel || !fetchedChannel.isVoiceBased()) {
    return;
  }

  // If empty, delete it
  if (shouldDeleteChannel(channel)) {
    await deleteVoiceChannel(client, channel.id);
  }
};

const handleSwitch = async (
  client: Client<true>,
  oldChannel: VoiceBasedChannel,
  member: GuildMember,
  cfg: ClickToCreateConfig
) => {
  // Handle leaving the old channel
  await handleLeave(client, oldChannel, member);
  
  // Handle joining the new channel (if it's a trigger)
  if (cfg) {
    await handleJoin(client, member, cfg);
  }
};

const VoiceStateUpdateListener = new ClientEventListener({
  event: 'voiceStateUpdate',
  async run(client, oldState, newState) {
    // Ensure both states are (valid/available) guild events
    if (
      !isGuildEvent(oldState)
      || !isGuildEvent(newState)
      || !isGuildAvailable(newState)
      || !isGuildAvailable(oldState)
    ) {
      return;
    }

    // Resolve event type and relevant channel/member
    const eventType = resolveEvent(oldState, newState);
    const [channel, member] = [
      resolveChannel(eventType, oldState, newState),
      eventType === 'join' ? newState.member : oldState.member,
    ];

    // Determine if we should handle this event, and get the relevant config
    const cfg = shouldHandleEvent(eventType, channel, member, config);
    if (!cfg) {
      return;
    }

    // Log and handle the event
    Logger.info(`Handling voice state update event: ${eventType} for member ${member.user.tag} in channel ${channel?.id || 'none'}`);
    switch (eventType) {
      case 'join':
        await handleJoin(client, member, cfg);
        break;
      case 'leave':
        if (!channel) {
          throw new Error('Channel ID is undefined on leave event');
        }
        await handleLeave(client, channel, member);
        break;
      case 'switch':
        if (!oldState.channel || !newState.channel) {
          throw new Error('Channel IDs are undefined on switch event');
        }
        await handleSwitch(client, oldState.channel, member, cfg);
        break;
      case 'state':
      default:
        break;
    }
  },
})

export default VoiceStateUpdateListener;
