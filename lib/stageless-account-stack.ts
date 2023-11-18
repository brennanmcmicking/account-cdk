import * as cdk from "aws-cdk-lib";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { HttpsRedirect } from "aws-cdk-lib/aws-route53-patterns";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class StagelessAccountStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fullZone = HostedZone.fromLookup(this, "FullHostedZone", {
      domainName: "brennanmcmicking.net",
    });

    const shortZone = HostedZone.fromLookup(this, "ShortHostedZone", {
      domainName: "brnn.ca",
    });

    new HttpsRedirect(this, "MainSiteRedirects", {
      recordNames: ["brennanmcmicking.net"],
      targetDomain: "www.brennanmcmicking.net",
      zone: fullZone,
    });

    new HttpsRedirect(this, "ShortDomainRedirects", {
      recordNames: ["brnn.ca", "www.brnn.ca"],
      targetDomain: "www.brennanmcmicking.net",
      zone: shortZone,
    });
  }
}
