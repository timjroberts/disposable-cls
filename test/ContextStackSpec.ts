import * as mocha from "mocha";
import { expect } from "chai";
import { ContextStack } from "../src/ContextStack";
import { SimpleMockObject, SimpleDisposableMockObject } from "./MockObjects";

/*
 * Test fixture for ContextStack
 */
describe("ContextStack", () => {
	let contextStack = new ContextStack();

	describe("when scheduling an asynchronous function", () => {
		it("should capture a context stack item with data containing the last pushed context items", () => {
			contextStack.pushScope([new SimpleMockObject()]);

			let context = contextStack.create();

			expect(context.data).to.not.be.undefined;
			expect(context.data["SimpleMockObject"]).to.not.be.undefined;
		});

		it("should capture a context stack item that references a parent context stack item during an asynchronous invocation chain", () => {
			let context = contextStack.create();

			contextStack.before(null, context);

			try {
				let newContext = contextStack.create();

				expect(newContext.parent).to.be.equal(context);
			}
			finally {
				contextStack.after(null, context);
			}
		});

		it("should add a reference to the parent context stack item during an asynchronous invocation chain", () => {
			let context = contextStack.create();

			try {
				contextStack.before(null, context);

				let newContext = contextStack.create();

				expect(context.refCount).to.be.equal(2);
				expect(newContext.refCount).to.be.equal(1);
			}
			finally {
				contextStack.after(null, context);
			}
		});
	});

	describe("when executing an asynchronous function", () => {
		it("should not be resetable during invocation", () => {
			let context = contextStack.create();

			contextStack.before(null, context);

			try {
				expect(ContextStack.tryReset()).to.be.false;
			}
			finally {
				contextStack.after(null, context);
			}
		});

		it("should set the active context item before invocation", () => {
			contextStack.pushScope([new SimpleMockObject()]);

			let context = contextStack.create();

			contextStack.before(null, context);

			try {
				expect(contextStack.findContextObjectFromScope(SimpleMockObject)).to.not.be.undefined;
			}
			finally {
				contextStack.after(null, context);
			}
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

			try {
				expect(contextStack.findContextObjectFromScope(SimpleMockObject)).to.be.undefined;
			}
			finally {
				contextStack.after(null, currentContext);
			}
		});
	});
});
