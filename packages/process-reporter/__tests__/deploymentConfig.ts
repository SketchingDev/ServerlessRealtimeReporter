import * as serverlessManifest from "../.serverless/manifest.json";

interface Manifest {
    default: { dev: { outputs: { OutputKey: string, OutputValue: string }[] } }
}

const readGraphQlApi = (manifest: Manifest) => {
    const outputs = manifest.default.dev.outputs;
    return {
        url: outputs.find(({OutputKey}) => OutputKey === "GraphQlApiUrl")!.OutputValue,
        key: outputs.find(({OutputKey}) => OutputKey === "GraphQlApiKeyDefault")!.OutputValue
    }
};

export const getDeploymentConfig = ()  => {
    const manifest: Manifest = serverlessManifest as any;
    return {
        region: "us-east-1",
        graphql: readGraphQlApi(manifest)
    }
};
