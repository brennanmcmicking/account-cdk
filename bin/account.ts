#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StagelessAccountStack } from "../lib/stageless-account-stack";
import { AccountStack } from "../lib/account-stack";

const app = new cdk.App();
new StagelessAccountStack(app, "StagelessAccountStack", {
  env: { account: "446708209687", region: "us-west-2" },
  crossRegionReferences: true,
});

new AccountStack(app, "AccountStack-dev", {
  env: { account: "446708209687", region: "us-west-2" },
  stage: "dev",
});

new AccountStack(app, "AccountStack-prod", {
  env: { account: "446708209687", region: "us-west-2" },
  stage: "prod",
});
