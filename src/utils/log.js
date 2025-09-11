// src/utils/log.js
import { redact } from "./redact";
export function log(...args){ console.log(...args.map(a=>redact(typeof a==="string"?a:JSON.stringify(a)))); }
export function warn(...args){ console.warn(...args.map(a=>redact(typeof a==="string"?a:JSON.stringify(a)))); }
export function error(...args){ console.error(...args.map(a=>redact(typeof a==="string"?a:JSON.stringify(a)))); }
