use aws_sdk_s3::Client;
use aws_smithy_http::endpoint::Endpoint as SmithyEndpoint;
use std::str::FromStr;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let endpoint = std::env::var("CEPH_ENDPOINT")
        .expect("CEPH_ENDPOINT must be set");

    let buckets = vec!["videos", "media", "archive"];

    let shared_config = aws_config::from_env()
        .endpoint_resolver(SmithyEndpoint::from_str(&endpoint)?)
        .load()
        .await;

    let mut conf_builder = aws_sdk_s3::config::Builder::from(&shared_config);
    conf_builder = conf_builder.force_path_style(true);
    let s3_config = conf_builder.build();
    let client = Client::from_conf(s3_config);

    println!("=== Checking CORS configuration for Ceph buckets ===");

    for bucket in &buckets {
        match client.get_bucket_cors().bucket(bucket).send().await {
            Ok(resp) => {
                println!("🔍 [{}] Current CORS configuration:", bucket);
                if let Some(cors) = resp.cors_configuration() {
                    for (i, rule) in cors.cors_rules().iter().enumerate() {
                        println!("  Rule {}:", i + 1);
                        println!("    AllowedOrigins: {:?}", rule.allowed_origins());
                        println!("    AllowedMethods: {:?}", rule.allowed_methods());
                        println!("    AllowedHeaders: {:?}", rule.allowed_headers());
                        println!("    ExposeHeaders: {:?}", rule.expose_headers());
                        println!("    MaxAgeSeconds: {:?}", rule.max_age_seconds());
                    }
                } else {
                    println!("  (no CORS configuration found)");
                }
            }
            Err(e) => {
                let err_str = format!("{}", e);
                if err_str.contains("NoSuchCORSConfiguration") {
                    println!("⚠️ [{}] No CORS configuration set.", bucket);
                } else {
                    eprintln!("❌ [{}] Error fetching CORS: {}", bucket, e);
                }
            }
        }
    }

    println!("✅ All buckets checked. Verification complete.");
    Ok(())
}
