import * as cdk from "aws-cdk-lib";
import { EndpointType, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";

export interface AccountStackPros extends cdk.StackProps {
  stage: string;
}

export class AccountStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AccountStackPros) {
    super(scope, id, props);
    const isTest = props.stage !== "prod";

    const api = new RestApi(this, `RestApi-${props.stage}`, {
      deployOptions: {
        stageName: isTest ? "dev" : "prod",
        throttlingBurstLimit: 10,
        throttlingRateLimit: 10,
      },
      domainName: {
        domainName: (isTest ? "devapi" : "api") + ".brennanmcmicking.net",
        certificate: Certificate.fromCertificateArn(
          this,
          `Cert-${props.stage}`,
          "arn:aws:acm:us-east-1:446708209687:certificate/954abdfb-b567-498e-af2b-02669ff4507a"
        ),
        basePath: "v1",
        endpointType: EndpointType.EDGE,
      },
    });

    const mock = api.root.addResource("mock");
    mock.addMethod("GET", undefined, {
      apiKeyRequired: isTest,
    });

    const spotify = api.root.addResource("spotify");
    this.createExport("SpotifyResource", props.stage, spotify.resourceId);

    if (isTest) {
      const key = api.addApiKey(`ApiKey-${props.stage}`);
      const plan = api.addUsagePlan(`ApiUsagePlan-${props.stage}`, {
        name: "usage-plan",
      });
      plan.addApiKey(key);
      plan.addApiStage({
        api,
        stage: api.deploymentStage,
      });
    }

    const hostedZone = HostedZone.fromHostedZoneAttributes(
      this,
      `HostedZone-${props.stage}`,
      {
        hostedZoneId: "Z045204614CI9B8AAMLRQ",
        zoneName: "brennanmcmicking.net",
      }
    );

    new ARecord(this, `ARecord-${props.stage}`, {
      zone: hostedZone,
      recordName: (isTest ? "devapi" : "api") + ".brennanmcmicking.net",
      target: RecordTarget.fromAlias(new ApiGateway(api)),
    });

    this.createExport("ApiGatewayId", props.stage, api.restApiId);
    this.createExport(
      "ApiGatewayRootId",
      props.stage,
      api.restApiRootResourceId
    );
  }

  createExport(name: string, stage: string, value: string) {
    const exportName = `${name}${stage}`;
    new cdk.CfnOutput(this, exportName, {
      exportName,
      value,
    });
  }
}
