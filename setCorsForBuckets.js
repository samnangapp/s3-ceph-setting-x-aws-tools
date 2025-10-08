// ==== Ceph S3 CORS Configuration Script ====
// Purpose:
// - Configures CORS policies for S3-compatible buckets (e.g., Ceph) to align with CloudFront CORS settings.
// - Iterates through a user-defined list of bucket names.
// - Applies CORS rules to allow requests from *.your-app.com with GET and HEAD methods.
// - Includes error handling and logs results for each bucket.

// Usage:
// - npm install aws-sdk
// - Run with: `node setCorsForBuckets.js`
// - Ensure AWS SDK credentials and bucket names are configured before execution.

// Output:
// - === Starting CORS configuration for Ceph buckets ===
// - ✅ CORS successfully applied to bucket: videos
// - ✅ CORS successfully applied to bucket: media
// - ✅ CORS successfully applied to bucket: archive
// - ✅ All done! CORS configuration completed for all buckets.

// Notes:
// - Compatible with any S3-compliant endpoint.
// - Verify your CloudFront CORS policy matches the configured rules to avoid access issues.

// What This Script Does (Summary):
// - Matches your AWS policy:
// - Access-Control-Allow-Origin → https://your-app.com, https://*.your-app.com
// - Access-Control-Allow-Methods → GET, HEAD
// - Access-Control-Max-Age → 600
// - Access-Control-Allow-Headers → *
// - Works for multiple buckets (add them in BUCKETS array)
// - Safe to run multiple times — it just overwrites CORS settings.

const AWS = require("aws-sdk");
const https = require("https");

// ====== CONFIGURE YOUR CREDENTIALS AND ENDPOINT ======
const ACCESS_KEY_ID = "Pf0bwWzH72QKa7cTlI41";
const SECRET_ACCESS_KEY = "pCR8IopdtadqVVzJtDhl48bNvspM5HCftRoOnmLS";
const ENDPOINT = "https://s3-domain.com";

// List all buckets you want to update
const BUCKETS = ["robotic-bk", "robotic-bk0"]; // 👈 Add more if needed

// ====== DEFINE CORS CONFIGURATION (same as AWS policy) ======
const CORSConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "HEAD"],
      AllowedOrigins: ["https://your-app.com", "https://*.your-app.com"],
      ExposeHeaders: [],
      MaxAgeSeconds: 600,
    },
  ],
};

// ====== INITIALIZE S3 CLIENT ======
const httpsAgent = new https.Agent({
  rejectUnauthorized: true, // keep true for SSL validation
});

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  endpoint: ENDPOINT,
  s3ForcePathStyle: true, // Ceph requires this
  signatureVersion: "v4",
  httpOptions: { agent: httpsAgent },
});

// ====== FUNCTION TO SET CORS CONFIG ======
async function setCorsForBucket(bucketName) {
  const corsParams = {
    Bucket: bucketName,
    CORSConfiguration: CORSConfiguration,
  };

  try {
    await s3.putBucketCors(corsParams).promise();
    console.log(`✅ CORS successfully applied to bucket: ${bucketName}`);
  } catch (error) {
    console.error(`❌ Error applying CORS to ${bucketName}:`, error.message);
  }
}

// ====== MAIN EXECUTION ======
(async () => {
  console.log("=== Starting CORS configuration for Ceph buckets ===");

  for (const bucket of BUCKETS) {
    await setCorsForBucket(bucket);
  }

  console.log("✅ All done! CORS configuration completed for all buckets.");
})();
