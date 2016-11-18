# lulo Elastic Transcoder Pipeline

lulo Elastic Transcoder Pipeline creates an Amazon Elastic Trancoder Pipeline.

lulo Elastic Transcoder Pipeline is a [lulo](https://github.com/carlnordenfelt/lulo) plugin

# Installation
```
$ npm install lulo-plugin-elastictranscoder-pipeline --save
```

## Usage
### Properties
See the [AWS SDK Documentation for ElasticTranscoder::createPipeline](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ElasticTranscoder.html#createPipeline-property)

### Return Values
When the logical ID of this resource is provided to the Ref intrinsic function, Ref returns the Id of the Pipeline.

#### Arn
`{ "Fn::GetAtt: ["Pipeline", ""Arn"] }"`

Returns the Pipeline Arn

### Required IAM Permissions
The Custom Resource Lambda requires the following permissions for this plugin to work:
```
{
   "Effect": "Allow",
   "Action": [
       "elastictranscoder:CreatePipeline",
       "elastictranscoder:DeletePipeline",
       "elastictranscoder:UpdatePipeline",
       "elastictranscoder:UpdatePipelineNotifications",
       "elastictranscoder:UpdatePipelineStatus"
   ],
   "Resource": "*"
}
```

## License
[The MIT License (MIT)](/LICENSE)

## Change Log
[Change Log](/CHANGELOG.md)
