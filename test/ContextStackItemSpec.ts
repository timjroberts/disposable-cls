import * as mocha from "mocha";
import { expect } from "chai";
import { ContextStackItem } from "../src/ContextStackItem";

/*
 * Test fixture for ContextStackItem
 */
describe("ContextStackItem", () => {
	describe("when initialized", () => {
		it("should have a single reference count", () => {
			expect(new ContextStackItem(undefined, null).refCount).to.equal(1);
		});
	});

	describe("when referenced", () => {
		it("should have an incremented reference count", () => {
			let stackItem = new ContextStackItem(undefined, null);
			let currentRefCount = stackItem.refCount;

			expect(stackItem.addRef()).to.equal(currentRefCount + 1);
			expect(stackItem.refCount).to.equal(currentRefCount + 1);
		});
	});

	describe("when released", () => {
		it("should have a decremented reference count", () => {
			let stackItem = new ContextStackItem(undefined, null);
			let currentRefCount = stackItem.refCount;

			expect(stackItem.release()).to.equal(currentRefCount - 1);
			expect(stackItem.refCount).to.equal(currentRefCount - 1);
		});
	});
});