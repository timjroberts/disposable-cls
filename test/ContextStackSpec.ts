import * as mocha from "mocha";
import { expect } from "chai";
import { ContextStack } from "../src/ContextStack";

/**
 * Represents a very simple object.
 */
class SimpleMockObject { }

/**
 * Represents a very simple 'disposable' object.
 */
class SimpleDisposableMockObject {
	constructor(private disposeCallback: Function) { }

	public dispose() {
		this.disposeCallback();
	}
}

/*
 * Test fixture for ContextStack
 */
describe("ContextStack", () => {
	let contextStack = new ContextStack();

	beforeEach(() => {
		if (!contextStack.tryReset()) {
			throw new Error("ContextStack could not be reset.");
		}
	});

	describe("when scheduling an asynchronous function", () => {
		it("should capture a context stack item with no data if no context items have been pushed", () => {
			let context = contextStack.create();

			expect(context.data).to.be.undefined;
			expect(context.parent).to.be.null;
		});

		it("should capture a context stack item with data containing the last pushed context items", () => {
			contextStack.pushScope([new SimpleMockObject()]);

			let context = contextStack.create();

			expect(context.data).to.not.be.undefined;
			expect(context.data["SimpleMockObject"]).to.not.be.undefined;
		});

		it("should capture a context stack item that references a parent context stack item during an asynchronous invocation chain", () => {
			let context = contextStack.create();

			contextStack.before(null, context);

			let newContext = contextStack.create();

			expect(newContext.parent).to.be.equal(context);

			contextStack.after(null, context);
		});

		it("should add a reference to the parent context stack item during an asynchronous invocation chain", () => {
			let context = contextStack.create();

			contextStack.before(null, context);

			let newContext = contextStack.create();

			expect(context.refCount).to.be.equal(2);
			expect(newContext.refCount).to.be.equal(1);

			contextStack.after(null, context);
		});
	});

	describe("when executing an asynchronous function", () => {
		it("should not be resetable during invocation", () => {
			let context = contextStack.create();

			contextStack.before(null, context);

			expect(contextStack.tryReset()).to.be.false;

			contextStack.after(null, context);
		});

		it("should set the active context item before invocation", () => {
			contextStack.pushScope([new SimpleMockObject()]);

			let context = contextStack.create();

			contextStack.before(null, context);

			expect(contextStack.findContextObjectFromScope(SimpleMockObject)).to.not.be.undefined;

			contextStack.after(null, context);
		});

		it("should dispose of the active context item after invocation", () => {
			let wasDisposed = false;

			contextStack.pushScope([new SimpleDisposableMockObject(() => { wasDisposed = true; })]);

			let context = contextStack.create();

			contextStack.after(null, context);

			expect(wasDisposed).to.be.true;
			expect(contextStack.findContextObjectFromScope(SimpleDisposableMockObject)).to.be.undefined;
		});

		it("should dispose of the active context item after invocation has thrown an error", () => {
			let wasDisposed = false;

			contextStack.pushScope([new SimpleDisposableMockObject(() => { wasDisposed = true; })]);

			let context = contextStack.create();

			contextStack.error(context, new Error());

			expect(wasDisposed).to.be.true;
			expect(contextStack.findContextObjectFromScope(SimpleDisposableMockObject)).to.be.undefined;
		});

		it("should find context items across all context stack items", () => {
			contextStack.pushScope([new SimpleMockObject()]);

			let parentContext = contextStack.create();
			let currentContext = contextStack.create();

			expect(currentContext.data).to.be.undefined;

			contextStack.before(null, currentContext);

			expect(contextStack.findContextObjectFromScope(SimpleMockObject)).to.be.undefined;

			contextStack.after(null, currentContext);
		});
	});
});
