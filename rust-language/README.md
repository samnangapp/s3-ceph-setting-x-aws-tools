# s3-ceph-setting-x-aws-tools
For configurations on S3 buckets or users

## 🧰 Ceph S3 CORS & Policy Management Tools

### Purpose
This toolkit provides Node.js scripts for managing CORS and public access policies on Ceph S3-compatible buckets, similar to AWS S3 or CloudFront settings.

It supports:
- ✅ Applying custom CORS rules
- ✅ Verifying current bucket CORS settings
- ✅ Resetting (removing) all CORS configurations
- ✅ Applying both CORS + public bucket policy together

All scripts are safe to run multiple times — they simply overwrite or remove CORS configurations as needed.

## 📦 Requirements
- Node.js v16+
- `aws-sdk` library installed

Install once:
```bash
npm install aws-sdk
```

Each script uses the same credentials and endpoint configuration. Update these constants in the scripts before running:
```javascript
const ACCESS_KEY_ID = "YourAccessKey";
const SECRET_ACCESS_KEY = "YourSecretKey";
const ENDPOINT = "https://your.ceph.endpoint";
```

## ⚙️ Scripts Overview
| Script | Purpose | Typical Usage |
|--------|---------|---------------|
| `setCorsForBuckets.js` | Applies new CORS rules (GET/HEAD allowed, origins like `*.your-app.com`) | `node setCorsForBuckets.js` |
| `verifyCorsForBuckets.js` | Reads back and prints the current CORS config for each bucket | `node verifyCorsForBuckets.js` |
| `resetCorsForBuckets.js` | Deletes all CORS rules (reverts to default / no CORS) | `node resetCorsForBuckets.js` |
| `setCorsAndPolicyForBuckets.js` | Applies CORS + public GetObject policy together | `node setCorsAndPolicyForBuckets.js` |

## 🚀 1. Set CORS Configuration
**File:** `setCorsForBuckets.js`

**What it does:**
- Applies CORS rules similar to AWS CloudFront.
- Allows requests from your domain (e.g., `https://your-app.com`, `https://*.your-app.com`).
- Allows GET and HEAD methods.
- Sets `Access-Control-Max-Age` to 600 seconds.

**Output Example:**
```
=== Starting CORS configuration for Ceph buckets ===
✅ [videos] CORS successfully applied
✅ [media] CORS successfully applied
✅ [archive] CORS successfully applied
✅ All done! CORS configuration completed for all buckets.
```

## 🔍 2. Verify CORS Configuration
**File:** `verifyCorsForBuckets.js`

**What it does:**
- Fetches and displays each bucket’s current CORS settings.
- Confirms whether the configuration matches expectations.

**Usage:**
```bash
node verifyCorsForBuckets.js
```

**Expected Output:**
```
=== Checking CORS configuration for Ceph buckets ===
🔍 [videos] Current CORS configuration:
  AllowedOrigins: [ 'https://your-app.com', 'https://*.your-app.com' ]
  AllowedMethods: [ 'GET', 'HEAD' ]
  MaxAgeSeconds: 600
✅ All buckets checked. Verification complete.
```

## 🧹 3. Reset / Remove CORS Configuration
**File:** `resetCorsForBuckets.js`

**What it does:**
- Deletes all CORS rules from selected buckets.
- Restores Ceph bucket to its default (no CORS headers returned).

**Usage:**
```bash
node resetCorsForBuckets.js
```

**Expected Output:**
```
=== Starting CORS reset for Ceph buckets ===
🧹 [videos] CORS configuration deleted.
🧹 [media] CORS configuration deleted.
⚠️ [archive] No CORS configuration to delete.
✅ All done! Buckets now have no CORS rules.
```

## 🌍 4. Set CORS + Public Bucket Policy
**File:** `setCorsAndPolicyForBuckets.js`

**What it does:**
- Applies both:
  - CORS rules (as above)
  - Public `GetObject` policy so anyone can access files (e.g., for static websites or media hosting).

**Usage:**
```bash
node setCorsAndPolicyForBuckets.js
```

**Expected Output:**
```
=== Starting CORS + Policy setup for Ceph buckets ===
✅ [videos] CORS applied
✅ [videos] Public bucket policy applied
✅ All done! CORS and policy configuration completed for all buckets.
```

## 🧪 5. Testing & Verification
### 🧠 Backend Check
Run the verify script again after any change:
```bash
node verifyCorsForBuckets.js
```

### 🌐 HTTP (curl) Test
Use the OPTIONS method to confirm headers:
```bash
curl -i -X OPTIONS \
  -H "Origin: https://your-app.com" \
  -H "Access-Control-Request-Method: GET" \
  https://s3fs.kosalkan.com/videos/testfile.mp4
```

**Expected headers:**
```
Access-Control-Allow-Origin: https://your-app.com
Access-Control-Allow-Methods: GET, HEAD
Access-Control-Max-Age: 600
```

**After reset:**
These headers disappear (default state restored).

### 🧩 Browser Fetch Test
```javascript
fetch("https://s3fs.kosalkan.com/videos/sample.mp4", { mode: "cors" })
  .then(res => console.log("✅ Success:", res))
  .catch(err => console.error("❌ CORS Error:", err));
```

## 🧰 Notes & Tips
- Works with Ceph, MinIO, Wasabi, or any S3-compatible endpoint.
- Safe to re-run — it overwrites CORS settings cleanly.
- Does not delete or modify objects inside buckets.
- Combine with your CI/CD pipeline for environment consistency.
- Always verify after changes to ensure CloudFront or browser caching doesn’t affect results.

## 📁 Folder Structure Example
```
ceph-cors-tools/
├── setCorsForBuckets.js
├── verifyCorsForBuckets.js
├── resetCorsForBuckets.js
├── setCorsAndPolicyForBuckets.js
├── README.md
└── package.json
```

## 💬 Example Use Case
You want your Ceph bucket `videos` to:
- Serve public videos via CloudFront
- Allow GET/HEAD requests from `your-app.com`
- Be accessible directly in a browser

Then run:
```bash
node setCorsAndPolicyForBuckets.js
node verifyCorsForBuckets.js
```

If later you want to close public access or reconfigure:
```bash
node resetCorsForBuckets.js
```