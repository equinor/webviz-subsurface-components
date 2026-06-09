import { TextDecoder, TextEncoder } from "node:util";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.TextDecoder = TextDecoder as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.TextEncoder = TextEncoder as any;
