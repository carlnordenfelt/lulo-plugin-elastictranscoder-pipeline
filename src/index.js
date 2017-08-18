'use strict';

var aws = require('aws-sdk');
var elasticTranscoder = new aws.ElasticTranscoder({ apiVersion: '2012-09-25' });

var pub = {};

pub.validate = function (event) {
    if (!event.ResourceProperties.InputBucket) {
        throw new Error('Missing required property InputBucket');
    }
    if (!event.ResourceProperties.Name) {
        throw new Error('Missing required property Name');
    }
    if (!event.ResourceProperties.Role) {
        throw new Error('Missing required property Role');
    }
};

pub.create = function (event, _context, callback) {
    delete event.ResourceProperties.ServiceToken;
    var params = event.ResourceProperties;
    elasticTranscoder.createPipeline(params, function (error, response) {
        if (error) {
            return callback(error);
        }

        var data = {
            physicalResourceId: response.Pipeline.Id,
            Arn: response.Pipeline.Arn
        };
        callback(null, data);
    });
};

pub.update = function (event, _context, callback) {
    delete event.ResourceProperties.ServiceToken;
    delete event.ResourceProperties.OutputBucket; // Not accepted by SDK
    var params = event.ResourceProperties;
    params.Id = event.PhysicalResourceId;
    elasticTranscoder.updatePipeline(params, function (error, response) {
        if (error) {
            return callback(error);
        }

        var data = {
            physicalResourceId: response.Pipeline.Id,
            Arn: response.Pipeline.Arn
        };
        callback(null, data);
    });
};

pub.delete = function (event, _context, callback) {
    if (!event.PhysicalResourceId.match(/^\d{13}-\w{6}$/)) {
        return setImmediate(callback);
    }

    var params = {
        Id: event.PhysicalResourceId
    };
    elasticTranscoder.deletePipeline(params, function (error) {
        if (error && error.code !== 'ResourceNotFoundException') {
            return callback(error);
        }
        callback();
    });
};

module.exports = pub;
