import type { Guild, VoiceBasedChannel } from "discord.js";
import type { ClickToCreateConfig } from "../schema/schemas";
import { Logger } from "../logger";

const resolveChannelAnchor = (
  guild: Guild,
  config: ClickToCreateConfig,
): number | undefined => {
  let positionAnchor = config.channelPositionAnchor
    ? guild.channels.cache.get(config.channelPositionAnchor)
    : null;

  if (positionAnchor) {
    let invalidated = false;
    if (positionAnchor.parentId !== config.categoryId) {
      Logger.warn(`Position anchor channel ${config.channelPositionAnchor} is not in the configured category ${config.categoryId}. Ignoring position anchor.`);
      invalidated = true;
    }
    if (!positionAnchor.isVoiceBased()) {
      Logger.warn(`Position anchor channel ${config.channelPositionAnchor} is not a voice channel. Ignoring position anchor, as voice channels can only be positioned among other voice channels (at the bottom of the category).`);
      invalidated = true;
    }
    
    if (invalidated) {
      positionAnchor = null;
    } else {
      Logger.info(`Using position anchor channel ${config.channelPositionAnchor} for new channel placement.`);
      positionAnchor = positionAnchor as VoiceBasedChannel;
    }
  }

  return positionAnchor ? positionAnchor.position + 1 : undefined;
}

export {
  resolveChannelAnchor,
}
