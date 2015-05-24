'use strict';
var AWS = require('aws-sdk');
var config = require('config');
var BBPromise = require('bluebird');
var logger = require('@hoist/logger');
var moment = require('moment');
AWS.config.update({
  accessKeyId: config.get('Hoist.aws.account'),
  secretAccessKey: config.get('Hoist.aws.secret'),
  region: config.get('Hoist.aws.region')
});



var autoscaling = BBPromise.promisifyAll(new AWS.AutoScaling());

module.exports = function (ami, buildNumber, sha) {
  //var scalingGroupName = 'execution-test-group';
  var scalingGroupName = 'executors';
  var creationTime = moment();
  var launchConfigName = "executors-" + creationTime.valueOf() + '-' + buildNumber + "-" + sha;
  var launchConfig = {
    "LaunchConfigurationName": launchConfigName,
    "ImageId": ami,
    "AssociatePublicIpAddress": true,
    "BlockDeviceMappings": [{
      "DeviceName": "/dev/sdb",
      "NoDevice": true
    }, {
      "DeviceName": "/dev/sdc",
      "NoDevice": true
    }, {
      "DeviceName": "/dev/sda1",
      "Ebs": {
        "VolumeSize": 50,
        "VolumeType": "standard",
        "DeleteOnTermination": true
      }
    }],
    "SecurityGroups": [
      "sg-aa85f4cf",
      "sg-d8f18abd"
    ],
    "KeyName": "OwensProvisioningPair",
    "UserData": "IyEvYmluL2Jhc2gKVVVJRD0kKGN1cmwgaHR0cDovLzE2OS4yNTQuMTY5LjI1NC9sYXRlc3QvbWV0YS1kYXRhL2luc3RhbmNlLWlkKQpzdWRvIGNoZWYtY2xpZW50IC1yIHJvbGVbaG9pX2V4ZWN1dG9yX3NlcnZlcl0gLUUgYXdzX3VzX3dlc3RfMiAtTiBleGVjdXRvci0kVVVJRApzdWRvIHN1IGhvaS1hcHBzIC1jIC1sICdjZCAvdmFyL3d3dy9leGVjdXRvci9jdXJyZW50ICYmIHBtMiBzdGFydE9yUmVsb2FkIGFwcGxpY2F0aW9uLmpzb24n",
    "InstanceType": "t2.small",
    "InstanceMonitoring": {
      "Enabled": true
    },
  };
  logger.info({
    launchConfig: launchConfig
  }, 'creating build config');
  var autoScalingConfig = {
    AutoScalingGroupName: scalingGroupName,
    LaunchConfigurationName: launchConfigName

  };
  var tags = {
    Tags: [{
      "ResourceId": scalingGroupName,
      "ResourceType": "auto-scaling-group",
      "Key": "SHA",
      "Value": sha,
      "PropagateAtLaunch": true
    }, {
      "ResourceId": scalingGroupName,
      "ResourceType": "auto-scaling-group",
      "Key": "build",
      "Value": "https://circleci.com/gh/hoist/executor/" + buildNumber,
      "PropagateAtLaunch": true
    }]
  };
  logger.info('creating auto scaling group');
  return autoscaling.createLaunchConfigurationAsync(launchConfig)
    .then(function () {
      logger.info({
        autoScalingConfig: autoScalingConfig
      }, 'creating auto scaling group');
      return autoscaling.updateAutoScalingGroupAsync(autoScalingConfig).then(function (data) {
        logger.info({
          data: data
        }, 'auto scaling group');
      });
    }).then(function () {
      logger.info({
        tags: tags
      }, 'updating tags');
      return autoscaling.createOrUpdateTagsAsync(tags);
    }).then(function () {
      var scalingPolicyConfig = {
        AdjustmentType: 'ChangeInCapacity',
        AutoScalingGroupName: scalingGroupName,
        PolicyName: 'increase-executors',
        ScalingAdjustment: 1,
        Cooldown: 150,
      };
      logger.info({
        scalingPolicyConfig: scalingPolicyConfig
      }, 'putting scaling policy');
      return autoscaling.putScalingPolicyAsync(scalingPolicyConfig);
    }).then(function () {
      var scalingPolicyConfig = {
        AdjustmentType: 'ChangeInCapacity',
        AutoScalingGroupName: scalingGroupName,
        PolicyName: 'decrease-executors',
        ScalingAdjustment: -1,
        Cooldown: 150,
      };
      logger.info({
        scalingPolicyConfig: scalingPolicyConfig
      }, 'putting scaling policy');
      return autoscaling.putScalingPolicyAsync(scalingPolicyConfig);

    }).catch(function (err) {
      logger.alert(err);
      logger.error(err);
    });

  /*


  });*/

};
