import gcloud from '@battis/partly-gcloudy';
import { Core } from '@qui-cli/core';
import { Shell } from '@qui-cli/shell';
const { values: { force, user: users = [] } } = await Core.init({
    optList: {
        user: {
            description: 'Email address of user(s) to whom to give IAP access'
        }
    },
    flag: {
        force: {
            description: 'Force re-running the setup wizard.',
            short: 'f'
        }
    }
});
const wizard = force || !process.env.PROJECT;
if (wizard) {
    await gcloud.batch.run.initialize({
        suggestedName: 'Localhost IAP',
        env: true
    });
    await gcloud.services.enable(gcloud.services.API.CloudResourceManagerAPI);
}
const project = gcloud.projects.active.get();
const { service } = await gcloud.batch.run.deployService({
    env: true,
    args: {
        source: './app',
        max: 1,
        'no-allow-unauthenticated': false
    }
});
const region = service.metadata.labels['cloud.googleapis.com/location'];
Shell.exec(`gcloud beta run services update ${service.metadata.name} ` +
    `--region=${region} ` +
    `--iap ` +
    `--project=${project?.projectId} --format=json --quiet`);
if (wizard) {
    Shell.exec(`gcloud run services add-iam-policy-binding ${service.metadata.name} ` +
        `--region=${region} ` +
        `--member=serviceAccount:service-${project?.projectNumber}@gcp-sa-iap.iam.gserviceaccount.com ` +
        `--role=roles/run.invoker ` +
        `--project=${project?.projectId} --format=json --quiet`);
}
for (const user of users) {
    Shell.exec(`gcloud beta iap web add-iam-policy-binding --member=user:${user} --role=roles/iap.httpsResourceAccessor --region=${region} --resource-type=cloud-run --service=${service.metadata.name} --project=${project?.projectId} --format=json --quiet`);
}
