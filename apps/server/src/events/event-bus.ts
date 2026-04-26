import { EventEmitter } from 'events';

// Create a centralized Event Bus for domain-driven decoupling
class EventBus extends EventEmitter {}

export const eventBus = new EventBus();
