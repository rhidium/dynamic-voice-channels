import { GatewayIntentBits } from 'discord.js';
import { appConfig } from './config';
import Client from 'rhidium/src/core/client'
import { ClientManager, commandDeploymentEnvironment } from 'rhidium/src/core/commands';
import { I18n } from 'rhidium/src/core/i18n'

const main = async () => {
  await I18n.init();
  const manager = new ClientManager();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    manager,
  });

  manager.register(
    // ...systemRegistry,
    // ...utilityRegistry,
    // ...moderationRegistry,
  );

  await Promise.all([
    client.login(appConfig.client.token, {
      guildId: commandDeploymentEnvironment,
      clearOtherEnvironment: process.env.NODE_ENV !== 'production',
      forceSync: false,
    }),
  ]);
};

void main();
