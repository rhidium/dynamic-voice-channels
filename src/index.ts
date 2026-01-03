import { GatewayIntentBits } from 'discord.js';
import { appConfig } from './config';
import Client from 'rhidium/core/client';
import { I18n } from 'rhidium/core/i18n';
import { commandDeploymentEnvironment } from 'rhidium/core/commands/defaults';
import { ClientManager } from 'rhidium/core/commands/manager';

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
      clearOtherEnvironment: process.env['NODE_ENV'] !== 'production',
      forceSync: false,
    }),
  ]);
};

void main();
