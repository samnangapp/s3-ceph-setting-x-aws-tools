use aws_sdk_s3::Client;
use aws_smithy_http::endpoint::Endpoint as SmithyEndpoint;
use std::str::FromStr;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let endpoint = std::env::var("CEPH_ENDPOINT").expect("CEPH_ENDPOINT must be set");
    let buckets = vec!["videos", "media", "archive"];

    let shared_config = aws_config::from_env()
        .endpoint_resolver(SmithyEndpoint::from_str(&endpoint)?)
        .load()
        .await;

    let mut conf_builder = aws_sdk_s3::config::Builder::from(&shared_config);
    conf_builder = conf_builder.force_path_style(true);
    let s3_config = conf_builder.build();
    let client = Client::from_conf(s3_config);

    println!("=== Starting CORS reset for Ceph buckets ===");

    for bucket in &buckets {
        match client.delete_bucket_cors().bucket(bucket).send().await {
            Ok(_) => println!("🧹 [{}] CORS configuration deleted.", bucket),
            Err(e) => {
                let err_str = format!("{}", e);
                if err_str.contains("NoSuchCORSConfiguration") {
                    println!("⚠️ [{}] No CORS configuration to delete.", bucket);
                } else {
                    eprintln!("❌ [{}] Error deleting CORS: {}", bucket, e);
                }
            }
        }
    }

    println!("✅ All done! Buckets now have no CORS rules.");
    Ok(())
}
