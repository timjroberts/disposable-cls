import { ContextStack  } from "./ContextStack";

var contextStack = new ContextStack();


/**
 * Ensures that the provided context ojects are preserved across the continuations that occur
 * from the supplied root function.
 * 
 * @param {Object[]} contextItems The objects that are to be preserved in the current scope.
 * @param {Function} callback The root function that will have the preserved scope applied to it.
 */
export function using(contextItems: Object[], callback: Function): void {
	contextStack.pushScope(contextItems);

	setImmediate(callback);
}

/**
 * Retrieves a context object from the current scope.
 * 
 * @param {Function} objectType The constructor representing the type of object that should be retrieved.
 * @returns The current context object for the type of object requested, or 'undefined' if no
 * object was found in the current scope. 
 */
export function getCurrentObject(objectType: Function): Object {
	return contextStack.findContextObjectFromScope(objectType);
}


process.addAsyncListener(contextStack);
