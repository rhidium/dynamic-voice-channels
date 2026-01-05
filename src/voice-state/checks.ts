import type { GuildMember, VoiceState } from "discord.js";
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

const resolveChannelId = (eventType: string, oldState: VoiceState, newState: VoiceState) => {
  if (eventType === 'join') {
    return newState.channelId;
  }
  if (eventType === 'leave') {
    return oldState.channelId;
  }
  if (eventType === 'switch') {
    return newState.channelId;
  }
  return null;
}

const shouldHandleEvent = (
  eventType: string,
  channelId: string | null,
  member: GuildMember | null,
  config: ReturnType<typeof loadClickToCreateConfig>,
): false | ClickToCreateConfig => {
  if (!member || !channelId) {
    return false;
  }

  if (member.user.bot) {
    return false;
  }

  for (const cfg of config) {
    if (cfg.channelId === channelId) {
      if (eventType === 'join' || eventType === 'leave' || eventType === 'switch') {
        return cfg;
      }
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
  resolveChannelId,
  shouldHandleEvent,
  isGuildEvent,
  isGuildAvailable,
}