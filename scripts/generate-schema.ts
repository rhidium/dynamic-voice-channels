import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { clickToCreateSchema } from '../src/schema/schemas';

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
