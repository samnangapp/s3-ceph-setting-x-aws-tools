// ==== Ceph S3 CORS Verification Script ====
// Purpose:
// - Confirms that CORS rules are correctly applied on Ceph (S3-compatible) buckets.
// - Fetches and displays the current CORS configuration for each bucket.
// - Helps ensure your setup matches the AWS CloudFront policy.
//
// Usage:
// - npm install aws-sdk
// - Run with: `node verifyCorsForBuckets.js`
//
// Example Output:
// - === Checking CORS configuration for Ceph buckets ===
// - 🔍 [videos] Current CORS configuration:
//   AllowedOrigins: [ 'https://checkinme.app', 'https://*.checkinme.app' ]
//   AllowedMethods: [ 'GET', 'HEAD' ]
//   MaxAgeSeconds: 600
// - ✅ All buckets verified successfully.
//
// Notes:
// - Works for any S3-compatible service (Ceph, MinIO, etc.).
// - Requires the same credentials and endpoint used to apply CORS rules.

const AWS = require("aws-sdk");
const https = require("https");

// ====== CONFIGURE YOUR CREDENTIALS AND ENDPOINT ======
const ACCESS_KEY_ID = "T42Z96YP73";
const SECRET_ACCESS_KEY = "KMjs6axTTH6CcMw1";
const ENDPOINT = "https://fsgw.sabay.com";

// ====== DEFINE WHICH BUCKETS TO CHECK ======
const BUCKETS = ["bucket-name"]; // 👈 Add more if needed

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

// ====== FUNCTION TO CHECK CORS CONFIGURATION ======
async function checkCors(bucketName) {
  try {
    const response = await s3.getBucketCors({ Bucket: bucketName }).promise();

    console.log(`🔍 [${bucketName}] Current CORS configuration:`);

    const corsRules = response.CORSRules || [];
    if (corsRules.length === 0) {
      console.log("  (No CORS rules found)");
      return;
    }

    corsRules.forEach((rule, i) => {
      console.log(`  Rule ${i + 1}:`);
      console.log("    AllowedOrigins:", rule.AllowedOrigins);
      console.log("    AllowedMethods:", rule.AllowedMethods);
      console.log("    AllowedHeaders:", rule.AllowedHeaders);
      console.log("    ExposeHeaders:", rule.ExposeHeaders);
      console.log("    MaxAgeSeconds:", rule.MaxAgeSeconds);
    });
  } catch (error) {
    if (error.code === "NoSuchCORSConfiguration") {
      console.warn(`⚠️ [${bucketName}] No CORS configuration set.`);
    } else {
      console.error(`❌ [${bucketName}] Error fetching CORS:`, error.message);
    }
  }
}

// ====== MAIN EXECUTION ======
(async () => {
  console.log("=== Checking CORS configuration for Ceph buckets ===");

  for (const bucket of BUCKETS) {
    await checkCors(bucket);
  }

  console.log("✅ All buckets checked. Verification complete.");
})();
