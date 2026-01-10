import { type GuildMember, type VoiceBasedChannel, type VoiceState } from "discord.js";
import type { loadClickToCreateConfig } from "../config";
import type { ClickToCreateConfig } from "../schema/schemas";

const resolveEvent = (oldState: VoiceState, newState: VoiceState) => {
  if (!oldState.channelId && newState.channelId) {
    return 'join';
  }
  if (oldState.channelId && !newState.channelId) {
    return 'leave';
  }
  if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    return 'switch';
  }
  return 'state';
};

const resolveChannel = (eventType: string, oldState: VoiceState, newState: VoiceState) => {
  if (eventType === 'join' || eventType === 'switch') {
    return newState.channel;
  }
  if (eventType === 'leave') {
    return oldState.channel;
  }
  return null;
}

const shouldHandleEvent = (
  eventType: string,
  channel: VoiceBasedChannel | null,
  member: GuildMember | null,
  config: ReturnType<typeof loadClickToCreateConfig>,
): false | ClickToCreateConfig => {
  if (!member || !channel) {
    return false;
  }

  if (member.user.bot) {
    return false;
  }

  for (const cfg of config) {
    if (eventType === 'state') {
      return false;
    }

    if (eventType === 'join' || eventType === 'switch') {
      if (cfg.channelId === channel.id) {
        return cfg;
      }

      continue;
    }

    if (eventType === 'leave') {
      if (cfg.channelId !== channel.id && channel.members.size === 0) {
        return cfg;
      }

      continue;
    }
  }

  return false;
}

const isGuildEvent = (state: VoiceState): state is VoiceState & {
  guild: NonNullable<VoiceState['guild']>;
  member: NonNullable<VoiceState['member']>;
} => {
  if (!state.guild) {
    return false;
  }
  return true;
}

const isGuildAvailable = (state: VoiceState): state is VoiceState & {
  guild: Omit<NonNullable<VoiceState['guild']>, 'available'> & { available: true };
} => {
  if (!isGuildEvent(state)) {
    return false;
  }

  return state.guild.available;
}

export {
  resolveEvent,
  resolveChannel,
  shouldHandleEvent,
  isGuildEvent,
  isGuildAvailable,
}