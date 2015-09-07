import * as mocha from "mocha";
import {expect} from "chai";
import {ContextStack} from "../src/ContextStack";
import {using, getCurrentObject} from "../src/index";
import {SimpleMockObject, SimpleDisposableMockObject} from "./MockObjects";

describe("Single scope block", () => {
	it("should allow retrieval of a context item", (done) => {
		let mockObject = new SimpleDisposableMockObject(null);

		using([mockObject], () => {
			let objectInContext = <SimpleDisposableMockObject>getCurrentObject(SimpleDisposableMockObject);

			expect(objectInContext).to.not.be.undefined;
			expect(objectInContext.id).to.be.equal(mockObject.id);

			done();
		});
	});

	it("should dispose of the context items", () => {
		let wasDisposed = false;
		let mockObject = new SimpleDisposableMockObject(() => { wasDisposed = true; });

		using([mockObject], () => {
			expect(wasDisposed).to.be.false;
		});

		expect(wasDisposed).to.be.false;
	});
});


describe("Multiple scope block", () => {
	it("should retrieve the closest context item", (done) => {
		let mockObject1 = new SimpleDisposableMockObject(null);
		let mockObject2 = new SimpleDisposableMockObject(null);

		using([mockObject1], () => {
			let objectInContext = <SimpleDisposableMockObject>getCurrentObject(SimpleDisposableMockObject);

			expect(objectInContext).to.not.be.undefined;
			expect(objectInContext.id).to.be.equal(mockObject1.id);

			using([mockObject2], () => {
				let objectInContext = <SimpleDisposableMockObject>getCurrentObject(SimpleDisposableMockObject);

				expect(objectInContext).to.not.be.undefined;
				expect(objectInContext.id).to.be.equal(mockObject2.id);

				done();
			});
		});
	});

	it("should walk the stack to retrieve the closest context item", (done) => {
		let mockObject = new SimpleDisposableMockObject(null);

		using([mockObject], () => {
			using([new SimpleMockObject()], () => {
				let objectInContext = <SimpleDisposableMockObject>getCurrentObject(SimpleDisposableMockObject);

				expect(objectInContext).to.not.be.undefined;
				expect(objectInContext.id).to.be.equal(mockObject.id);

				done();
			});
		});
	});

	it("should dispose of the context items only when all scope blocks go out of scope", (done) => {
		let disposedCount = 0;
		let doneFlag = false;

		let expectationsOnCompleteFunc = () => {
			if (doneFlag) {
				expect(disposedCount).to.be.equal(2);

				return done();
			}

			setImmediate(expectationsOnCompleteFunc);
		};

		let disposeFunc = () => { disposedCount++; };

		let mockObject1 = new SimpleDisposableMockObject(disposeFunc);
		let mockObject2 = new SimpleDisposableMockObject(disposeFunc);

		using([mockObject1], () => {
			expect(disposedCount).to.be.equal(0);

			using([mockObject2], () => {
				expect(disposedCount).to.be.equal(0);

				doneFlag = true;
			});
		});

		setImmediate(expectationsOnCompleteFunc);
	});
});
