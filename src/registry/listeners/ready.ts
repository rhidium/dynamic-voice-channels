import { ClientEventListener } from "rhidium/core/commands/events";
import { reconcileDynamicChannels } from "../../voice-state/service";
import { Logger } from "../../logger";

const ReadyListener = new ClientEventListener({
  event: 'clientReady',
  once: false,
  async run(client) {
    Logger.info('Bot ready! Reconciling dynamic voice channels...');
    await reconcileDynamicChannels(client);
  },
});

export default ReadyListener;
