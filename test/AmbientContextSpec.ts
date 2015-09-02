import * as mocha from "mocha";
import { expect } from "chai";
import { using, getCurrentObject } from "../src/index";

/**
 * Represents a simple object that is accessible through a static property.
 */
class MockContext {
	private _id: number;

	/**
	 * Initializes a new instance of the mock context object.
	 */
	constructor() {
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
			var mockObject = new MockContext();

			using([mockObject], () => {
				expect(MockContext.current).to.not.be.undefined;
				expect(MockContext.current.id).to.be.equal(mockObject.id);
				done();
			});
		});
	});
});
