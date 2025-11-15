/**
 * =========================================================
 *  Ceph S3 Bucket Public / Private Toggle Script
 * =========================================================
 * Usage:
 *    node toggleBucketPublic.js public   → Make bucket PUBLIC
 *    node toggleBucketPublic.js private  → Make bucket PRIVATE
 *
 * What it does:
 *   - PUBLIC: Applies a public bucket policy ("s3:GetObject")
 *   - PRIVATE: Deletes policy + enforces private bucket behavior
 *
 * NOTES:
 *   - Safe to run many times
 *   - Works with Ceph, MinIO, AWS, and all S3-compatible systems
 *   - HTTPS verification disabled only if your Ceph uses self-signed certs
 * =========================================================
 */

const AWS = require("aws-sdk");
const https = require("https");

// ================== CONFIGURATION ==================
const ENDPOINT = "https://fsgw.sabay.com";
const ACCESS_KEY_ID = "T42Z96YP7"; // change your key id
const SECRET_ACCESS_KEY = "KMjs6axTTH6CcMw1MC4TLJ"; // change your access key
const BUCKET_NAME = "bucket-name"; // change your bucket
// ====================================================

// Bypass SSL if Ceph uses self-signed certificate
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Create S3 client
const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  endpoint: ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
  httpOptions: { agent: httpsAgent },
});

// ========== PUBLIC BUCKET POLICY (GET OBJECTS) ==========
const publicBucketPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:GetObject"],
      Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
    },
  ],
};

// ===================================================
// MAKE BUCKET PUBLIC
// ===================================================
async function makePublic() {
  console.log(`🔓 Making bucket PUBLIC: ${BUCKET_NAME}`);

  try {
    // Apply public bucket policy
    await s3
      .putBucketPolicy({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(publicBucketPolicy),
      })
      .promise();

    // Allow public policies to take effect (unblock)
    await s3
      .putPublicAccessBlock({
        Bucket: BUCKET_NAME,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      })
      .promise();

    console.log("✅ SUCCESS: Bucket is now PUBLIC");
  } catch (err) {
    console.error("❌ Error making bucket public:", err);
  }
}

// ===================================================
// MAKE BUCKET PRIVATE (REMOVE PUBLIC POLICY)
// ===================================================
async function makePrivate() {
  console.log(`🔐 Making bucket PRIVATE: ${BUCKET_NAME}`);

  try {
    // Delete bucket policy
    await s3
      .deleteBucketPolicy({
        Bucket: BUCKET_NAME,
      })
      .promise();

    // Enforce private mode
    await s3
      .putPublicAccessBlock({
        Bucket: BUCKET_NAME,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      })
      .promise();

    console.log("✅ SUCCESS: Bucket is now PRIVATE");
  } catch (err) {
    if (err.code === "NoSuchBucketPolicy") {
      console.log("⚠️ Bucket policy already removed.");
    } else {
      console.error("❌ Error making bucket private:", err);
    }
  }
}

// ===================================================
// MAIN EXECUTION
// ===================================================
async function run() {
  const mode = process.argv[2];

  if (!mode || !["public", "private"].includes(mode)) {
    console.log(`
Usage:
  node toggleBucketPublic.js public   → Make bucket PUBLIC
  node toggleBucketPublic.js private  → Make bucket PRIVATE
`);
    return;
  }

  if (mode === "public") await makePublic();
  if (mode === "private") await makePrivate();
}

run();
