package com.example.metamorph.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

// Configuration class to initialize AWS S3 beans
@Configuration 
public class AwsConfig {
    // AWS region configured in application properties
    @Value("${aws.region}")
    private String region;

    // Creates and configures the standard AWS S3 client bean
    @Bean 
    public S3Client s3Client(){
        return S3Client.builder()
                       .region(Region.of(region))
                       .credentialsProvider(DefaultCredentialsProvider.builder().build())
                       .build();
    }

    // Creates and configures the S3 presigner bean used for pre-signed URLs
    @Bean 
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                          .region(Region.of(region))
                          .credentialsProvider(DefaultCredentialsProvider.builder().build())
                          .build();
    }
}
