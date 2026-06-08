import { schema } from './schema.js';

export function decodeDocumentFile(data: Uint8Array): unknown {
  return schema.decodeDocumentFile(data);
}
