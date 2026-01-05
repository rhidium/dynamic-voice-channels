import { main } from 'rhidium/main'

import registry from './registry';
import utilityRegistry from "rhidium/modules/utility";
import { GatewayIntentBits } from 'discord.js';

main({
  components: [
    ...registry,
    ...utilityRegistry,
  ],
  clientOptions: {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
    ]
  }
})
