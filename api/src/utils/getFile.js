const { DefaultAzureCredential } = require("@azure/identity");
const { BlobServiceClient } = require("@azure/storage-blob");

async function main() {
  // Enter your storage account name
  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;

  const defaultAzureCredential = new DefaultAzureCredential();
  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    defaultAzureCredential
  );
  // Create a container
  const containerName = `newcontainer${new Date().getTime()}`;
  const createContainerResponse = await blobServiceClient
    .getContainerClient(containerName)
    .create();
  console.log(
    `Created container ${containerName} successfully`,
    createContainerResponse.requestId
  );
}
main().catch((err) => {
  console.error("Error running sample:", err.message);
});
