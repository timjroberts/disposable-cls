"use strict";

import {EventEmitter} from "events";
import * as mocha from "mocha";
import {expect} from "chai";
import {using, getCurrentObject} from "../src/index";
import {SimpleMockObject,   SimpleDisposableMockObject} from "./MockObjects";

describe("Promises", () => {
	describe("in single scope block", () => {
		it("should have access to the current context items when executing", (done) => {
            let promiseFactory = function (): Promise<boolean> {
                return new Promise<boolean>((resolve, reject) => {
                    if (getCurrentObject(SimpleMockObject)) {
                        return resolve(true);
                    }

                    resolve(false);
                });
            };

            using([SimpleMockObject], function () {
                promiseFactory()
                .then((result: boolean) => {
                    expect(result).to.be.true;

                    done();
                });
            });
        });

        it("should dispose of context items when completing", (done) => {
            let promiseFactory = function (): Promise<boolean> {
                return new Promise<boolean>((resolve, reject) => {
                    if (getCurrentObject(SimpleDisposableMockObject)) {
                        return resolve(true);
                    }

                    resolve(false);
                });
            };

            let wasDisposed = false;
            let mockObject = new SimpleDisposableMockObject(() => { wasDisposed = true; });

            using([mockObject], () => {
                promiseFactory()
                .then((result: boolean) => {
                    expect(wasDisposed).to.be.false;
                    //mockObject.dispose();
                });
            });

            setTimeout(() => {
                expect(wasDisposed).to.be.true;

                done();
            }, 100);
        });
    });
});
