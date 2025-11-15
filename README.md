# s3-ceph-setting-x-aws-tools

*For configurations on S3 buckets or users*

------------------------------------------------------------------------

## 🔧 Ceph S3 CORS & Policy Management Tools

### 🎯 Purpose

This toolkit provides **Node.js scripts** for managing:

-   🔄 **CORS**
-   🔐 **Public/Private access policies**
-   👀 **Bucket visibility**
-   ✅ **Verification tools**

Works with **Ceph / MinIO / AWS S3**.

It supports: - ⚙️ Applying custom CORS rules\
- 🔍 Verifying current bucket CORS settings\
- 🧹 Resetting (removing) all CORS configurations\
- 🔗 Applying both CORS + public bucket policy\
- 🌐 **Toggle bucket: PUBLIC ↔ PRIVATE**\
- 🆕 **Verify actual public access state**

> 🛡️ All scripts are **idempotent** --- safe to run multiple times.

------------------------------------------------------------------------

## 📦 Requirements

-   🟢 Node.js **v16+**
-   📚 `aws-sdk` library installed

Install:

``` bash
npm install aws-sdk
```

Each script uses the same connection settings --- **update these in
every file**:

``` javascript
const ACCESS_KEY_ID = "YourAccessKey";
const SECRET_ACCESS_KEY = "YourSecretKey";
const ENDPOINT = "https://your.ceph.endpoint";
```

------------------------------------------------------------------------

## 📜 Scripts Overview

  ---------------------------------------------------------------------------------------------------
  🧩 Script                         📝 Purpose                 ▶️ Usage
  --------------------------------- -------------------------- --------------------------------------
  `setCorsForBuckets.js`            🔄 Apply new CORS rules    `node setCorsForBuckets.js`

  `verifyCorsForBuckets.js`         🔍 Show current CORS       `node verifyCorsForBuckets.js`
                                    settings                   

  `resetCorsForBuckets.js`          🧹 Remove all CORS rules   `node resetCorsForBuckets.js`

  `setCorsAndPolicyForBuckets.js`   🔗 Apply CORS + Public     `node setCorsAndPolicyForBuckets.js`
                                    Policy                     

  `toggleBucketPublic.js`           🌐 Toggle                  `node toggleBucketPublic.js public`
                                    **PUBLIC/PRIVATE**         

  `verifyBucketPublic.js`           🆕 🔎 Verify actual bucket `node verifyBucketPublic.js`
                                    public state               
  ---------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 1️⃣ Set CORS Configuration

📁 **File:** `setCorsForBuckets.js`

### 🧭 What it does:

-   🌍 Adds allowed origins (`your-app.com`, subdomains)
-   🔥 Allows `GET` and `HEAD`
-   ⏱️ Sets `MaxAge` 600 seconds

------------------------------------------------------------------------

# 2️⃣ Verify CORS Configuration

📁 **File:** `verifyCorsForBuckets.js`

### 🧭 What it does:

-   🔍 Reads & prints each bucket's CORS rules

------------------------------------------------------------------------

# 3️⃣ Reset / Remove CORS

📁 **File:** `resetCorsForBuckets.js`

### 🧭 What it does:

-   🧹 Removes all CORS rules → bucket becomes default

------------------------------------------------------------------------

# 4️⃣ Set CORS + Public Policy

📁 **File:** `setCorsAndPolicyForBuckets.js`

### 🧭 What it does:

-   🔄 Sets CORS\
-   🌐 Makes bucket publicly readable (`GetObject`)

------------------------------------------------------------------------

# 5️⃣ Toggle Bucket PUBLIC / PRIVATE

📁 **File:** `toggleBucketPublic.js`

### 🧭 What it does:

-   🌐 **public** → anonymous GET allowed\
-   🔐 **private** → no anonymous access

------------------------------------------------------------------------

# 6️⃣ Verify Bucket Public Access (**NEW**)

📁 **File:** `verifyBucketPublic.js`

### 🧭 What it does:

-   🔍 Reads bucket policy\
-   🔐 Reads public-block settings\
-   🧠 Determines **actual** access state:
    -   🌍 **FULLY PUBLIC**
    -   🔒 **FULLY PRIVATE**
    -   ⚠️ **PARTIALLY PUBLIC / Misconfigured**

------------------------------------------------------------------------

# 🧪 Testing & Verification

------------------------------------------------------------------------

# 💡 Notes & Tips

-   🪣 Supports **Ceph, MinIO, Wasabi, AWS S3**
-   🔄 Safe to re-run
-   🗂️ Does **not** modify bucket objects
-   🔁 Recommend using in CI/CD pipelines
-   🧪 Always verify with `verifyBucketPublic.js`
-   🔏 Scripts disable SSL verification for self-signed certs

------------------------------------------------------------------------

# 📁 Folder Structure Example

    ceph-cors-tools/
    ├── setCorsForBuckets.js
    ├── verifyCorsForBuckets.js
    ├── resetCorsForBuckets.js
    ├── setCorsAndPolicyForBuckets.js
    ├── toggleBucketPublic.js
    ├── verifyBucketPublic.js
    ├── README.md
    └── package.json

------------------------------------------------------------------------

# 🚀 Example Use Case

## Want a public video bucket?

Run:

``` bash
node setCorsAndPolicyForBuckets.js
node toggleBucketPublic.js public
node verifyBucketPublic.js
```

## Want to lock it down later?

``` bash
node toggleBucketPublic.js private
node resetCorsForBuckets.js
node verifyBucketPublic.js
```

------------------------------------------------------------------------

**📅 Updated:** November 15, 2025 --- 🇰🇭 Cambodia
