import { main } from 'rhidium/main'

import utilityRegistry from 'rhidium/modules/utility';
import systemRegistry from 'rhidium/modules/system';
import moderationRegistry from 'rhidium/modules/moderation';

main({
  components: [
    ...systemRegistry,
    ...utilityRegistry,
    ...moderationRegistry,
  ]
})
