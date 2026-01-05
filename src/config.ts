import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { clickToCreateSchema, type ClickToCreate } from './schema/schemas';
import { validateClickToCreateConfig } from './schema/validation';
import { toDiscordClickToCreateConfigs } from './schema/permissions-utils';
import { Logger } from './logger';

const CLICK_TO_CREATE_CONFIG_PATH = './config/click-to-create.yaml';

/**
 * Load and parse the click-to-create configuration
 * @returns Validated click-to-create configuration
 * @throws Error if file doesn't exist or validation fails
 */
function loadClickToCreateConfig(
  onLoad?: (config: ClickToCreate) => void,
): ClickToCreate {
  try {
    const fileContent = readFileSync(CLICK_TO_CREATE_CONFIG_PATH, 'utf-8');
    const rawConfig = parseYaml(fileContent);

    // Validate raw/base schema
    const validatedConfig = clickToCreateSchema.parse(rawConfig);
    
    // Validate cross-config rules
    validateClickToCreateConfig(validatedConfig);

    // Handle callback (gracefully)
    if (onLoad) {
      try {
        onLoad(validatedConfig);
      } catch (callbackError) {
        Logger.error('Error in onLoad callback:', callbackError);
      }
    }
    
    return validatedConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to load click-to-create config from ${CLICK_TO_CREATE_CONFIG_PATH}: ${error.message}`,
      );
    }
    throw error;
  }
}

export {
  loadClickToCreateConfig,
  toDiscordClickToCreateConfigs,
}
