/**
 * =========================================================
 *  Ceph S3 Bucket Public Access Verification Script
 * =========================================================
 *
 * Usage:
 *    node verifyBucketPublic.js
 *
 * What it checks:
 *    - Does bucket have a bucket policy?
 *    - Does the policy allow public read (s3:GetObject)?
 *    - Do PublicAccessBlock settings block public access?
 *
 * Output:
 *    → FULLY PUBLIC
 *    → FULLY PRIVATE
 *    → PARTIALLY PUBLIC / MISCONFIGURED
 *
 * Works on:
 *    - Ceph
 *    - MinIO
 *    - AWS S3
 *    - All S3-compatible storage
 * =========================================================
 */

const AWS = require("aws-sdk");
const https = require("https");

// ====== CONFIGURATION ======
const ENDPOINT = "https://fsgw.s3.com";
const ACCESS_KEY_ID = "T42Z96YP7";
const SECRET_ACCESS_KEY = "KMjs6axTTH6CcMw1MC4TLJ";
const BUCKET_NAME = "bucket-name";
// ===========================

// Bypass SSL for Ceph self-signed certs
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Setup S3
const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  endpoint: ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
  httpOptions: { agent: httpsAgent },
});

/**
 * Fetch bucket policy if exists
 */
async function getBucketPolicy() {
  try {
    const result = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
    return JSON.parse(result.Policy);
  } catch (err) {
    if (err.code === "NoSuchBucketPolicy") {
      return null; // no policy exists
    }
    throw err;
  }
}

/**
 * Fetch Public Access Block config
 */
async function getPublicAccessBlock() {
  try {
    const result = await s3
      .getPublicAccessBlock({ Bucket: BUCKET_NAME })
      .promise();
    return result.PublicAccessBlockConfiguration;
  } catch (err) {
    if (err.code === "NoSuchPublicAccessBlockConfiguration") {
      return null; // no config present
    }
    throw err;
  }
}

/**
 * Analyze and determine public / private state
 */
function analyzeAccess(policy, pab) {
  let isPublicPolicy = false;

  if (policy) {
    for (const statement of policy.Statement) {
      if (
        statement.Effect === "Allow" &&
        statement.Principal === "*" &&
        statement.Action.includes("s3:GetObject")
      ) {
        isPublicPolicy = true;
      }
    }
  }

  let isBlocked = false;

  if (pab) {
    isBlocked =
      pab.BlockPublicAcls ||
      pab.IgnorePublicAcls ||
      pab.BlockPublicPolicy ||
      pab.RestrictPublicBuckets;
  }

  // --- Final results ---
  if (isPublicPolicy && !isBlocked) {
    return "PUBLIC";
  }

  if (!isPublicPolicy) {
    return "PRIVATE";
  }

  if (isPublicPolicy && isBlocked) {
    return "PARTIAL";
  }
}

/**
 * Main verify function
 */
async function verify() {
  console.log(`🔍 Checking bucket: ${BUCKET_NAME}`);

  try {
    const policy = await getBucketPolicy();
    const pab = await getPublicAccessBlock();

    console.log("\n📘 Bucket Policy:");
    console.log(policy ? JSON.stringify(policy, null, 2) : "❌ No Policy");

    console.log("\n📘 PublicAccessBlock:");
    console.log(pab ? pab : "❌ No PublicAccessBlock config");

    // Final verdict
    const status = analyzeAccess(policy, pab);

    console.log("\n============================");
    if (status === "PUBLIC") {
      console.log("✅ RESULT: Bucket is FULLY PUBLIC");
    } else if (status === "PRIVATE") {
      console.log("🔐 RESULT: Bucket is FULLY PRIVATE");
    } else {
      console.log(
        "⚠️ RESULT: Bucket is PARTIALLY PUBLIC or MISCONFIGURED (policy allows public but access-block settings prevent it)"
      );
    }
    console.log("============================\n");
  } catch (err) {
    console.error("❌ Error verifying bucket:", err);
  }
}

verify();
