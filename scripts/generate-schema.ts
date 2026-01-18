import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { clickToCreateSchema } from '../src/schema/schemas';

// Note: The exported schema is copied and used in mirasaki.dev/docs.
// If any changes are made to the schema, please remember to update the docs as well.

const logger = console;

const jsonSchema = clickToCreateSchema.toJSONSchema({
  cycles: 'ref',
  unrepresentable: 'throw',
});

const schemaDir = path.join(process.cwd(), 'json-schemas');
mkdirSync(schemaDir, { recursive: true });

const schemaPath = path.join(schemaDir, 'click-to-create.json');
writeFileSync(schemaPath, JSON.stringify(jsonSchema, null, 2));

logger.info(`Generated schema at ${schemaPath}`);
