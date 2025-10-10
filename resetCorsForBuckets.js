// ==== Ceph S3 Reset CORS Configuration Script ====
// Purpose:
// - Removes all custom CORS configurations from specified S3-compatible buckets (e.g., Ceph).
// - Effectively restores the bucket to its default “no CORS” state.
//
// Usage:
// - npm install aws-sdk
// - Run with: `node resetCorsForBuckets.js`
//
// Output:
// - === Starting CORS reset for Ceph buckets ===
// - 🧹 [videos] CORS configuration deleted.
// - 🧹 [media] CORS configuration deleted.
// - ✅ All done! Buckets now have no CORS rules.
//
// Notes:
// - Works for Ceph, MinIO, AWS S3, etc.
// - This does NOT affect bucket policies or object permissions — only CORS.

const AWS = require("aws-sdk");
const https = require("https");

// ====== CONFIGURE YOUR CREDENTIALS AND ENDPOINT ======
const ACCESS_KEY_ID = "T42Z96YP732R64J88FTV";
const SECRET_ACCESS_KEY = "KMjs6axTTH6CcMw1MC4TLJaK8NAgOm2oWwmpdqdv";
const ENDPOINT = "https://fsgw.sabay.com";

// ====== DEFINE WHICH BUCKETS TO RESET ======
const BUCKETS = ["robotic-tr"]; // 👈 Add more if needed

// ====== INITIALIZE S3 CLIENT ======
const httpsAgent = new https.Agent({
  rejectUnauthorized: true, // keep SSL validation
});

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  endpoint: ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
  httpOptions: { agent: httpsAgent },
});

// ====== FUNCTION TO DELETE CORS CONFIGURATION ======
async function deleteCors(bucketName) {
  try {
    await s3.deleteBucketCors({ Bucket: bucketName }).promise();
    console.log(`🧹 [${bucketName}] CORS configuration deleted.`);
  } catch (error) {
    if (error.code === "NoSuchCORSConfiguration") {
      console.warn(`⚠️ [${bucketName}] No CORS configuration to delete.`);
    } else {
      console.error(`❌ [${bucketName}] Error deleting CORS:`, error.message);
    }
  }
}

// ====== MAIN EXECUTION ======
(async () => {
  console.log("=== Starting CORS reset for Ceph buckets ===");

  for (const bucket of BUCKETS) {
    await deleteCors(bucket);
  }

  console.log("✅ All done! Buckets now have no CORS rules.");
})();
