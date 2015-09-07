# Continuation Local Storage (CLS)

Continuation Local Storage (CLS) works like thread local storage in most threaded programming languages,
but is instead based on chains of asynchronous callbacks rather than threads. This package allows you to set and
get values that are scoped to the lifetime of these asynchronous continuations without having to pass the values
via parameters or use closures, and also provides support for 'disposable' semantics at the end of the asynchronous
callback chain. _This is a pattern that will be familiar to Microsoft .NET developers who may have used `IDisposable`
implementations in conjunction with `using` scopes_.

This package was heaviliy inspired by https://github.com/othiym23/node-continuation-local-storage

```javascript
var using = require("disposable-cls").using;
var getCurrentObject = require("disposable-cls").getCurrentObject;

using([new HttpRequest()], function() {
	...
	var currentRequest = getCurrentObject(HttpRequest);
	...
});
```

The `using()` function establishes scope for the entire duration of the supplied function, regardless of whether that
function executes synchronously, or makes further asynchronous invocations. Furthermore, if the supplied context
objects define a `dispose()` function then it will be invoked when all synchronous and asynchronous functions complete
inside the supplied function.

## Exported Functions
#### using

using(_contextItems_: Object[], _asyncFunction_: Function)

Creates scope that will be preserved for the lifetime of the supplied asynchronous invocations.

contextItems: An array of objects that will be scoped.<br/>
asyncFunction: The root asynchronous function for which scope is to be preserved.

#### getCurrentObject

getCurrentObject(_objectType_: Function): Object

Retrieves an object from the current scope.

objectType: A constructor function representing the type of object that should be returned.

Returns an object from the current scope that is of the supplied type; or `undefined` if no object of that type could be
found in the current scope.

#### bindEventEmitter

bindEventEmitter(_emitter_: EventEmitter)

Binds the specified EventEmitter to the currently active context stack so that listeners added within that scope may
access the context items.

emitter: The EventEmitter to bind.

## Nested scopes

Use of the `using()` function can be nested to create scope hierarchies, and code can continue to access context objects
that have been established at any level in those scope hierarchies:

```javascript
using([new HttpRequest()], function() {
	...
	using([new DataTransaction()], function() {
		// Can still access the outer scope context objects
		var currentRequest = getCurrentObject(HttpRequest);
		
		var currentTransaction = getCurrentObject(DataTransaction);
	});
	...
});
```

## Example Ambient Context Implementation (TypeScript)

The following code demonstrates a typical class definition for implementing _ambient context_ that will be
preserved across all continuations encountered inside a `using()` block.

```javascript
export class MyContext {
	private _state: any;
	
	constructor(state: any) {
		this._state = state;			
	}
	
	public get state(): any {
		return this._state;
	}
	
	public static get current(): MyContext {
		return <MyContext>getCurrentObject(MyContext);
	} 	
}


using([new MyContext({ data: "Some Data" })], () => {
	let context = MyContext.current;
	
	if (context) {
		doSomethingWith(context.state);
	}
);
```

## EventEmitters

Callbacks registered as listeners for EventEmitters are not processed in the same way that asynchronous functions are.
As such, EventEmitter instances must be explicitly bound within the currently active scope using the `bindEventEmitter()`
function if they are to require access to it.

For example:

```javascript
let emitter = new EventEmitter();

using([new MyContext({ data: "Some Data" })], () => {
	emitter.on("my-event", () => {
		let currentState = MyContext.current.state;
		
		// MyContext.current will be undefined
	});
);
```

should be written to use the `bindEventEmitter()` function as follows:

```javascript
let emitter = new EventEmitter();

using([new MyContext({ data: "Some Data" })], () => {
	bindEventEmitter(emitter);
	
	emitter.on("my-event", () => {
		let currentState = MyContext.current.state;
		
		// MyContext.current will now be the currently in scope MyContext object
	});
);
```

It should be noted that any context objects that are bound to EventEmitter's will not be disposed of when all
asynchronous functions complete since the events emitted may occur beyond the scope of the `using()` block. As a result,
EventEmitters inside `using()` blocks should be used sparingly and with caution.