const { DefaultAzureCredential } = require("@azure/identity");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

// Enter your storage account name and shared key
const account = "pensarequipmentportal";
const accountKey =
  "tl1nGZxeF5j/5l6Nrmi5X0tIAZBrrt/uhbkMeTN69tEu5zactyi0cgF0h69ppbWcgk4X7JZdmL0JhVhYmbPzeA==";

// Use StorageSharedKeyCredential with storage account and account key
// StorageSharedKeyCredential is only available in Node.js runtime, not in browsers
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const containerName = "newcontainer1618538714408";

async function main() {
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const content = "Hello world!";
  const blobName = "newblob" + new Date().getTime();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.upload(
    content,
    content.length
  );
  console.log(
    `Upload block blob ${blobName} successfully`,
    uploadBlobResponse.requestId
  );
}

main().catch((err) => {
  console.error("Error running sample:", err.message, err);
});
