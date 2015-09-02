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

The `using` function establishes scope for the entire duration of the supplied function, regardless of whether that
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
