import { TextDecoder, TextEncoder } from "node:util";

globalThis.TextDecoder = TextDecoder as any;
globalThis.TextEncoder = TextEncoder as any;
