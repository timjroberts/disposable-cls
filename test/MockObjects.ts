"use strict";

/**
 * Represents a very simple object.
 */
export class SimpleMockObject { }


/**
 * Represents a very simple 'disposable' object.
 */
export class SimpleDisposableMockObject {
	private _id: number;

	/**
	 * Initializes a new instance of a disposable mock object.
	 *
	 * @param disposeCallback The callback that will be called when the current object
	 * is being disposed.
	 */
	constructor(private disposeCallback: Function) {
		this._id = Math.floor(Math.random());
	}

	/**
	 * Gets the identifier if the current mock object.
	 *
	 * @returns A number that uniquely identifies this mock object.
	 */
	public get id(): number {
		return this._id;
	}

	/**
	 * A dispose method that should be invoked by the context stack then this mock object
	 * goes out of scope.
	 */
	public dispose() {
		if (this.disposeCallback) {
			this.disposeCallback();
		}
	}
}
