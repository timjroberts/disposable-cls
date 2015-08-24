# Continuation Local Storage (CLS)

Continuation Local Storage (CLS) works like thread local storage in most threaded programming languages,
but is instead based on chains of asynchronous callbacks rather than threads. This package allows you to set and
get valeus that are scoped to the lifetime of these asynchronous continuations (without having to pass the values
via parameters or closures), and also provides support for 'disposable' semantics at the end of the asynchronous
callback chain. _This is a familiar pattern to Microsoft .NET developers who may use IDisposable implementations
in conjunction with `using` scopes_.

This package was heaviliy inspired by https://github.com/othiym23/node-continuation-local-storage


