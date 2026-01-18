import type { ComponentRegistry } from "rhidium/core/commands/manager";
import VoiceStateUpdateListener from "./listeners/voice-state-update";
import ReadyListener from "./listeners/ready";
import VoiceCommand from "./chat-input/voice";

const registry = [
  ReadyListener,
  VoiceStateUpdateListener,
  VoiceCommand,
] as ComponentRegistry;

export default registry;