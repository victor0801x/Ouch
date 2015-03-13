/**
 * ouch.spec.js
 *
 * @author: Harish Anchu <harishanchu@gmail.com>
 * @copyright 2015, Harish Anchu. All rights reserved.
 * @license Licensed under MIT (https://github.com/quorrajs/Ouch/blob/master/LICENSE)
 */

var sinon = require('sinon');
var util = require("util");
var Ouch = require('../../Ouch');

describe('Ouch main script', function(){

    describe('ouch', function(){
       it("should return a Ouch instance object with Ouch prototype methods", function(done){
           var ouch = getOuchInstance();
           ouch.should.be.an.object;
           ouch.getHandlers.should.be.a.function;
           ouch.pushHandler.should.be.a.function;
           ouch.popHandler.should.be.a.function;
           ouch.clearHandlers.should.be.a.function;
           ouch.handleException.should.be.a.function;
           done();
       })
    });

    describe('getHandlers and pushHandler', function(){
        it("should return an empty array when handlers are not present", function(done){
            getOuchInstance().getHandlers().should.be.an.Array.empty;
            done();
        });

        it("should return an non empty array when handlers are present", function(done){
            getOuchInstance().pushHandler(function(){}).getHandlers().should.be.an.Array.length(1);
            done();
        })

    });

    describe("popHandler", function(){
        it("should return a handler if exists", function(done){
           var ouch = getOuchInstance();

            (ouch.popHandler() === undefined).should.be.true;
            ouch.pushHandler(function(){}).popHandler().should.be.ok;

            done();
        });
    });

    describe("clearHandler", function(){
        it("should clear all existing handlers", function(done){
            getOuchInstance().pushHandler(function(){}).clearHandlers().getHandlers().should.be.an.Array.empty;
            done();
        });
    });

    describe("handleException", function(){
        it("should execute all the registered handlers and finally execute provided callback", function(done){
            var ouch = getOuchInstance();
            function StdErrHandler(){
                StdErrHandler.super_.call(this)
            }

            util.inherits(StdErrHandler, Ouch.handlers.BaseHandler);

            StdErrHandler.prototype.handle = function(next, e){
                next("handle resp");
            };

            var stdHandlerInstance = new StdErrHandler();

            sinon.spy(stdHandlerInstance, "handle");

            var spyErrHandler = sinon.spy(function(next, e){
                next("handle resp");
            });
            var error = new Error('test');

            ouch.pushHandler(spyErrHandler).pushHandler(stdHandlerInstance);

            ouch.handleException(error, null, null, function(responses){
                stdHandlerInstance.handle.calledOnce.should.be.ok;
                spyErrHandler.calledOnce.should.be.ok;

                var spyCall;
                spyCall = stdHandlerInstance.handle.getCall(0);
                spyCall.args[1].should.be.equal(error);

                spyCall = spyErrHandler.getCall(0);
                spyCall.args[1].should.be.equal(error);

                responses.should.be.eql(["handle resp", "handle resp"]);

                done();
            });
        });

        it("should call handler methods setRun, setInspector, setRequest and setResponse handler is an instance of HandlerBase", function(){
            var ouch = getOuchInstance();

            function StdErrHandler(){
                StdErrHandler.super_.call(this)
            }

            util.inherits(StdErrHandler, Ouch.handlers.BaseHandler);

            var stdHandlerInstance = new StdErrHandler();

            sinon.spy(stdHandlerInstance, "setRun");
            sinon.spy(stdHandlerInstance, "setInspector");
            sinon.spy(stdHandlerInstance, "setRequest");
            sinon.spy(stdHandlerInstance, "setResponse");

            ouch.pushHandler(stdHandlerInstance);

            ouch.handleException(new Error('test'), null, null, function(){
                stdHandlerInstance.setRun.calledOnce.should.be.ok;
                stdHandlerInstance.setInspector.calledOnce.should.be.ok;
                stdHandlerInstance.setRequest.calledOnce.should.be.ok;
                stdHandlerInstance.setResponse.calledOnce.should.be.ok;
            });
        });

    });
});

/**
 * @returns {Ouch}
 */
function getOuchInstance(){
    return new Ouch();
}

