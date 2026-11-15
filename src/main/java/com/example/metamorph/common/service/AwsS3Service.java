package com.example.metamorph.common.service;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Service 
public class AwsS3Service {
    private final S3Presigner presigner;

    @Value("${aws.s3.bucket}")
    private String bucket;

    public AwsS3Service(S3Presigner presigner){
        this.presigner = presigner;
    }

    // Generates a temporary pre-signed URL for direct file upload to S3 (valid for 5 minutes)
    public Map<String, String> createUploadUrl(String fileName, String contentType){
        // Sanitize file name and generate a unique temporary S3 key
        String safeName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String key = "temporary/" + UUID.randomUUID() + "-" + safeName;

        PutObjectRequest putRequest = PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentType(contentType)
            .build();
                                                    
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(5))
            .putObjectRequest(putRequest)
            .build();

        String url = presigner.presignPutObject(presignRequest).url().toString();
        return Map.of("url", url, "key", key);
    }

    // Generates a temporary pre-signed URL to download a file from S3 (valid for 5 minutes)
    public String createDownloadUrl(String key){
        GetObjectRequest getRequest = GetObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .build();
        
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(5))
            .getObjectRequest(getRequest)
            .build();
        
        return presigner.presignGetObject(presignRequest).url().toString();
    }
}
