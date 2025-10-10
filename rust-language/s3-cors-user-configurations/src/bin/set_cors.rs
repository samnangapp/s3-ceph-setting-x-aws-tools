use aws_sdk_s3::types::{CorsConfiguration, CorsRule};
use aws_sdk_s3::Client;
use aws_smithy_http::endpoint::Endpoint as SmithyEndpoint;
use std::str::FromStr;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Config from env
    let endpoint = std::env::var("CEPH_ENDPOINT")
        .expect("CEPH_ENDPOINT must be set, e.g. https://s3fs.kosalkan.com");

    // Buckets to update
    let buckets = vec!["videos", "media", "archive"];

    // Build sdk config with custom endpoint
    let shared_config = aws_config::from_env()
        .endpoint_resolver(SmithyEndpoint::from_str(&endpoint)?)
        .load()
        .await;

    let mut conf_builder = aws_sdk_s3::config::Builder::from(&shared_config);
    conf_builder = conf_builder.force_path_style(true);
    let s3_config = conf_builder.build();
    let client = Client::from_conf(s3_config);

    println!("=== Starting CORS configuration for Ceph buckets ===");

    // Build the CORS rule (match CloudFront screenshot)
    let cors_rule = CorsRule::builder()
        .allowed_headers("*")
        .allowed_methods("GET")
        .allowed_methods("HEAD")
        .allowed_origins("https://checkinme.app")
        .allowed_origins("https://*.checkinme.app")
        .max_age_seconds(600)
        .build();

    let cors_config = CorsConfiguration::builder().cors_rules(cors_rule).build();

    for bucket in &buckets {
        match client
            .put_bucket_cors()
            .bucket(bucket)
            .cors_configuration(cors_config.clone())
            .send()
            .await
        {
            Ok(_) => println!("✅ [{}] CORS successfully applied", bucket),
            Err(e) => eprintln!("❌ [{}] Error applying CORS: {}", bucket, e),
        }
    }

    println!("✅ All done! CORS configuration completed for all buckets.");
    Ok(())
}
