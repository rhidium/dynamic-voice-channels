import type { ComponentRegistry } from "rhidium/core/commands/manager";
import VoiceStateUpdateListener from "./listeners/voice-state-update";
import ReadyListener from "./listeners/ready";

const registry = [
  ReadyListener,
  VoiceStateUpdateListener,
] as ComponentRegistry;

export default registry;