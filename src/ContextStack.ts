import wrapEmitter = require("emitter-listener");
import {ContextStackItem} from "./ContextStackItem";

/**
 * Reacts to Node.js asynchronous scheduling events and manages a scope stack that will
 * be preserved across those asynchronous invocations.
 */
export class ContextStack implements NodeJS.AsyncListenerCallbacks {
	private static scopeStack: Object[] = [];
	private static activeContext: ContextStackItem = null;

	/**
	 * Called by Node.js when an asynchronous function is being scheduled.
	 * 
	 * The contextual items pushed onto the managed scope stack are captured and maintained
	 * throughout the lifetime of the asynchronous function being scheduled.
	 */
	public create(): ContextStackItem {
		ContextStack.captureStackItem(ContextStack.activeContext);

		return new ContextStackItem(ContextStack.scopeStack.pop(), ContextStack.activeContext);
	}

	/**
	 * Called by Node.js before an asynchronous function is to be executed.
	 * 
	 * @param context Represents the current 'this' object.
	 * @param contextStackItem The context stack item that was created for the asynchronous
	 * function.
	 */
	public before(context: any, contextStackItem: ContextStackItem): void {
		ContextStack.activeContext = contextStackItem;
	}

	/**
	 * Called by Node.js after an asynchronous function has executed.
	 * 
	 * @param context Represents the current 'this' object.
	 * @param contextStackItem The context stack item that was created for the asynchronous
	 * function.
	 */
	public after(context: any, contextStackItem: ContextStackItem): void {
		ContextStack.releaseStackItem(contextStackItem);
	}

	/**
	 * Called by Node.js if an asynchronous function has thrown an error.
	 * 
	 * @param contextStackItem The context stack item that was created for the asynchronous
	 * function.
	 * @param error The error that was thrown.
	 */
	public error(contextStackItem: any, error: Error): void {
		ContextStack.releaseStackItem(contextStackItem);
	}

	/**
	 * Pushes contextual items onto the managed scope stack so that they can be captured as part
	 * of a context stack item when the next asynchronous function is being scheduled.
	 * 
	 * @param contextItems The array of objects to capture.
	 */
	public pushScope(contextItems: Object[]): void {
		let scopeStackItem = {};

		contextItems.forEach((contextItem) => {
			scopeStackItem[(<any>contextItem.constructor).name] = contextItem;
		});

		ContextStack.scopeStack.push(scopeStackItem);
	}

	/**
	 * Searches the current context stack for a contextual item that was captured for the given
	 * type of object.
	 * 
	 * @param objectType The constructor function of the object that is required.
	 * @returns The object that is currently in scope, or 'undefined' if none was found.
	 */
	public findContextObjectFromScope(objectType: Function): Object {
		let objectTypeName = (<any>objectType).name;
		let context = ContextStack.activeContext;
		let object: Object = undefined;

		while (context) {
			object = context.data ? context.data[objectTypeName] : undefined;

			if (object) {
				return object;
			}

			context = context.parent;
		}

		return undefined;
	}

	/**
	* Bind an EventEmitter to the currently active context stack.
	* 
	* @param emitter The EventEmitter to bind.
	*/
	public bindEventEmitter(emitter: NodeJS.EventEmitter): void {
		const ACTIVE_CONTEXT_PROPERTY: string = "__cls_capturedcontext";

		let onAddListener = (listener: Function) => {
			if (!listener) {
				return;
			}

			listener[ACTIVE_CONTEXT_PROPERTY] = ContextStack.activeContext;
		};

		let onEmit = (listener: Function) => {
			return function() {
				let currentContext = ContextStack.activeContext;

				try {
					ContextStack.activeContext = <ContextStackItem>listener[ACTIVE_CONTEXT_PROPERTY];

					return listener.apply(this, arguments);
				}
				finally {
					ContextStack.activeContext = currentContext;
				}
			};
		};

		ContextStack.captureStackItem(ContextStack.activeContext);

		wrapEmitter(emitter, onAddListener, onEmit);
	}

	/**
	 * Resets the managed scope stack.
	 * 
	 * @returns A boolean flag indicating if the ContextStack could be reset.
	 */
	public static tryReset(): boolean {
		if (ContextStack.activeContext) {
			return false;
		}

		ContextStack.activeContext = null;
		ContextStack.scopeStack.splice(0, ContextStack.scopeStack.length);

		return true;
	}

	/**
	 * Captures a given context stack item by incrementing the reference counts across
	 * the entire stack.
	 * 
	 * @param contextStackItem The context stack item that is to be captured.
	 */
	private static captureStackItem(contextStackItem: ContextStackItem): void {
		let context = contextStackItem;

		while (context) {
			context.addRef();

			context = context.parent;
		}
	}

	/**
	 * Releases a given context stack item.
	 * 
	 * @param contextStackItem The context stack item that is to be released.
	 */
	private static releaseStackItem(contextStackItem: ContextStackItem): void {
		let context = contextStackItem;

		while (context) {
			if (context.release() === 0) {
				ContextStack.disposeStackItemObjects(context.data);
			}

			context = context.parent;
		}

		ContextStack.activeContext = contextStackItem.parent;
	}

	/**
	 * Disposes of objects in a given object by calling their 'dispose()' function if they
	 * have one.
	 * 
	 * @param data An object that will be enumerated.
	 */
	private static disposeStackItemObjects(data: Object): void {
		for (let key in data) {
			let object = data[key];

			if (object["dispose"]) {
				object.dispose();
			}
		}
	}
}