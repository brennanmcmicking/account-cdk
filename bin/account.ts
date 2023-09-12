#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AccountStack } from '../lib/account-stack';

const app = new cdk.App();
new AccountStack(app, 'AccountStack', {
  env: { account: '446708209687', region: 'us-west-2' },
  crossRegionReferences: true,
});