import {EventEmitter} from "events";
import * as mocha from "mocha";
import {expect} from "chai";
import {using, getCurrentObject, bindEventEmitter} from "../src/index";
import {SimpleMockObject, SimpleDisposableMockObject} from "./MockObjects";

describe("Event Emitters", () => {
	describe("in single scope block", () => {
		it("should have access to the current context items", (done) => {
			let emitter = new EventEmitter();

			using([new SimpleMockObject()], () => {
				bindEventEmitter(emitter);

				emitter.on("event", () => {
					expect(getCurrentObject(SimpleMockObject)).to.not.be.undefined;

					done();
				});
			});

			setImmediate(() => { emitter.emit("event"); });
		});

		it("should have access to the emitted arguments", (done) => {
			let emitter = new EventEmitter();

			using([new SimpleMockObject()], () => {
				bindEventEmitter(emitter);

				emitter.on("event", (...args: any[]) => {
					expect(args).to.have.length(2);
					expect(args[0]).to.be.equal(10);
					expect(args[1]).to.be.equal("Hello");

					done();
				});
			});

			setImmediate(() => { emitter.emit("event", 10, "Hello"); });
		});

		it("should not allow the captured context items to be disposed of", (done) => {
			let wasDisposed = false;
			let doneFlag = false;

			let expectationsOnCompleteFunc = () => {
				if (doneFlag) {
					// Expect the wasDisposed flag to remain false because even though the using block will
					// have completed, the bound EventEmitter will still receive emitted events. 
					expect(wasDisposed).to.be.false;

					return done();
				}

				setImmediate(expectationsOnCompleteFunc);
			};

			let emitter = new EventEmitter();

			using([new SimpleDisposableMockObject(() => { wasDisposed = true; })], () => {
				bindEventEmitter(emitter);

				emitter.on("event", () => {
					expect(wasDisposed).to.be.false;

					doneFlag = true;
				});
			});

			setImmediate(expectationsOnCompleteFunc);
			setImmediate(() => { emitter.emit("event"); });
		});
	});
});
