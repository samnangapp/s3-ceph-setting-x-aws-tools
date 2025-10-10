use aws_sdk_s3::Client;
use aws_smithy_http::endpoint::Endpoint as SmithyEndpoint;
use std::str::FromStr;
use serde_json::json;

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

    println!("=== Starting CORS + Public Policy configuration for Ceph buckets ===");

    // CORS rule
    let cors_rule = aws_sdk_s3::types::CorsRule::builder()
        .allowed_headers("*")
        .allowed_methods("GET")
        .allowed_methods("HEAD")
        .allowed_origins("https://checkinme.app")
        .allowed_origins("https://*.checkinme.app")
        .max_age_seconds(600)
        .build();
    let cors_config = aws_sdk_s3::types::CorsConfiguration::builder()
        .cors_rules(cors_rule)
        .build();

    for bucket in &buckets {
        // set CORS
        match client
            .put_bucket_cors()
            .bucket(bucket)
            .cors_configuration(cors_config.clone())
            .send()
            .await
        {
            Ok(_) => println!("✅ [{}] CORS applied", bucket),
            Err(e) => eprintln!("❌ [{}] Error applying CORS: {}", bucket, e),
        }

        // set public read policy
        let policy = json!({
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": "*",
              "Action": ["s3:GetObject"],
              "Resource": format!("arn:aws:s3:::{}/*", bucket)
            }
          ]
        });

        match client
            .put_bucket_policy()
            .bucket(bucket)
            .policy(policy.to_string())
            .send()
            .await
        {
            Ok(_) => println!("✅ [{}] Public bucket policy applied", bucket),
            Err(e) => eprintln!("❌ [{}] Error applying public policy: {}", bucket, e),
        }
    }

    println!("✅ All done! CORS + Policy configuration completed for all buckets.");
    Ok(())
}
