"use strict";

import * as mocha from "mocha";
import {expect} from "chai";
import {using, getCurrentObject} from "../src/index";

/**
 * Represents a simple object that is accessible through a static property.
 */
class MockContext {
	private _id: number;
	private _isDisposed: boolean;

	/**
	 * Initializes a new instance of the mock context object.
	 */
	constructor() {
		this._id = Math.floor(Math.random());
		this._isDisposed = false;
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
	 * Gets a flag indicating whether the object has been disposed.
	 *
	 * @returns 'true' if the object has been diposed; 'false' otherwise.
	 */
	public get isDisposed(): boolean {
		return this._isDisposed;
	}

	/**
	 * Disposes of the current object.
	 */
	public dispose(): void {
		this._isDisposed = true;
	}

	/**
	 * Retrieves the current mock object from the current scope.
	 *
	 * @returns The current mock object; or 'undefined' if a mock object is not present
	 * in the current scope.
	 */
	public static get current(): MockContext {
		return <MockContext>getCurrentObject(MockContext);
	}
}

describe("Ambient Context", () => {
	describe("with single scope block", () => {
		it("should allow retrieval of a context item", (done) => {
			let mockObject = new MockContext();

			using([mockObject], () => {
				expect(MockContext.current).to.not.be.undefined;
				expect(MockContext.current.id).to.be.equal(mockObject.id);
				done();
			});
		});

		it("should dispose of the context item when the scope block goes out of scope", (done) => {
			let mockObject = new MockContext();
			let doneFlag = false;

			let expectationsOnCompleteFunc = () => {
				if (doneFlag) {
					expect(mockObject.isDisposed).to.equal(true);

					return done();
				}

				setImmediate(expectationsOnCompleteFunc);
			};

			expect(mockObject.isDisposed).to.equal(false);

			using([mockObject], () => {
				expect(mockObject.isDisposed).to.equal(false);

				doneFlag = true;
			});

			setImmediate(expectationsOnCompleteFunc);
		});
	});
});
