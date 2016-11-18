'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');

describe('Index unit tests', function () {
    var subject;
    var createPipelineStub = sinon.stub();
    var updatePipelineStub = sinon.stub();
    var deletePipelineStub = sinon.stub();
    var event;

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var awsSdkStub = {
            ElasticTranscoder: function () {
                this.createPipeline = createPipelineStub;
                this.updatePipeline = updatePipelineStub;
                this.deletePipeline = deletePipelineStub;
            }
        };

        mockery.registerMock('aws-sdk', awsSdkStub);
        subject = require('../../src/index');
    });
    beforeEach(function () {
        createPipelineStub.reset().resetBehavior();
        createPipelineStub.yields(undefined, { Pipeline: { Id: 'Id', Arn: 'Arn' } });
        updatePipelineStub.reset().resetBehavior();
        updatePipelineStub.yields(undefined, { Pipeline: { Id: 'Id', Arn: 'Arn' } });
        deletePipelineStub.reset().resetBehavior();
        deletePipelineStub.yields();

        event = {
            ResourceProperties: {
                InputBucket: 'InputBucket',
                Name: 'Name',
                Role: 'Role'
            }
        };
    });
    after(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('validate', function () {
        it('should succeed', function (done) {
            subject.validate(event);
            done();
        });
        it('should fail if InputBucket is not set', function (done) {
            delete event.ResourceProperties.InputBucket;
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property InputBucket/);
            done();
        });
        it('should fail if Name is not set', function (done) {
            delete event.ResourceProperties.Name;
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property Name/);
            done();
        });
        it('should fail if Role is not set', function (done) {
            delete event.ResourceProperties.Role;
            function fn () {
                subject.validate(event);
            }
            expect(fn).to.throw(/Missing required property Role/);
            done();
        });
    });

    describe('create', function () {
        it('should succeed', function (done) {
            subject.create(event, {}, function (error, response) {
                expect(error).to.equal(null);
                expect(createPipelineStub.calledOnce).to.equal(true);
                expect(updatePipelineStub.called).to.equal(false);
                expect(deletePipelineStub.called).to.equal(false);
                expect(response.physicalResourceId).to.equal('Id');
                expect(response.Arn).to.equal('Arn');
                done();
            });
        });
        it('should fail due to createPipeline error', function (done) {
            createPipelineStub.yields('createPipeline');
            subject.create(event, {}, function (error, response) {
                expect(error).to.equal('createPipeline');
                expect(createPipelineStub.calledOnce).to.equal(true);
                expect(updatePipelineStub.called).to.equal(false);
                expect(deletePipelineStub.called).to.equal(false);
                expect(response).to.equal(undefined);
                done();
            });
        });
    });

    describe('update', function () {
        it('should succeed', function (done) {
            subject.update(event, {}, function (error, response) {
                expect(error).to.equal(null);
                expect(createPipelineStub.called).to.equal(false);
                expect(updatePipelineStub.calledOnce).to.equal(true);
                expect(deletePipelineStub.called).to.equal(false);
                expect(response.physicalResourceId).to.equal('Id');
                expect(response.Arn).to.equal('Arn');
                done();
            });
        });
        it('should fail due to updatePipeline error', function (done) {
            updatePipelineStub.yields('updatePipeline');
            subject.update(event, {}, function (error, response) {
                expect(error).to.equal('updatePipeline');
                expect(createPipelineStub.called).to.equal(false);
                expect(updatePipelineStub.calledOnce).to.equal(true);
                expect(deletePipelineStub.called).to.equal(false);
                expect(response).to.equal(undefined);
                done();
            });
        });
    });

    describe('delete', function () {
        it('should succeed', function (done) {
            subject.delete(event, {}, function (error, response) {
                expect(error).to.equal(undefined);
                expect(response).to.equal(undefined);
                done();
            });
        });
        it('should fail due to deletePipeline error', function (done) {
            deletePipelineStub.yields({ code: 'deletePipeline' });
            subject.delete(event, {}, function (error, response) {
                expect(error.code).to.equal('deletePipeline');
                expect(createPipelineStub.called).to.equal(false);
                expect(updatePipelineStub.called).to.equal(false);
                expect(deletePipelineStub.calledOnce).to.equal(true);
                expect(response).to.equal(undefined);
                done();
            });
        });
        it('should not fail if deletePipeline error is ResourceNotFound', function (done) {
            deletePipelineStub.yields({ code: 'ResourceNotFoundException' });
            subject.delete(event, {}, function (error, response) {
                expect(error).to.equal(undefined);
                expect(createPipelineStub.called).to.equal(false);
                expect(updatePipelineStub.called).to.equal(false);
                expect(deletePipelineStub.calledOnce).to.equal(true);
                expect(response).to.equal(undefined);
                done();
            });
        });
    });
});
