import { ContextStack } from "./ContextStack";

// Pull in the async-listener pollyfil if required
if (!process.addAsyncListener) {
	require("async-listener");
}

var contextStack = new ContextStack();

/**
 * Creates scope that will be preserved for the lifetime of the supplied asynchronous invocations.
 * 
 * @param contextItems An array of objects that will be scoped.
 * @param asyncFunction The root asynchronous function for which scope is to be preserved.
 */
export function using(contextItems: Object[], asyncFunction: Function): void {
	contextStack.pushScope(contextItems);
	setImmediate(asyncFunction);
}

/**
 * Retrieves an object from the current scope.
 * 
 * @param objectType A constructor function representing the type of object that should be returned.
 * @returns An object from the current scope that is of the supplied type; or 'undefined' if no
 * object of that type could be found in the current scope.
 */
export function getCurrentObject(objectType: Function): Object {
	return contextStack.findContextObjectFromScope(objectType);
}


process.addAsyncListener(contextStack);
