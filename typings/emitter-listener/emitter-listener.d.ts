declare module EmitterListener {
	/**
	 * Represents a function that performs an action on a listener function.
	 */
	export interface ListenerActionCallback {
		(listener: Function): void;
	}
}

/**
 * Wrap an EventEmitter's event listeners.
 * 
 * @param emitter The EventEmitter to be wrapped.
 * @param onAddListener Called when a listener is registered with the EventEmitter.
 * @param onEmit Called when a listener is about to be invoked via the EventEmitter's
 * `on()` function.
 */
declare function wrapEmitter(emitter: NodeJS.EventEmitter, onAddListener: EmitterListener.ListenerActionCallback, onEmit: EmitterListener.ListenerActionCallback): void;

declare module "emitter-listener" {
	export = wrapEmitter;
}
