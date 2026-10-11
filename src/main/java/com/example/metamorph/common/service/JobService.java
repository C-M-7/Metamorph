package com.example.metamorph.common.service;

import org.springframework.stereotype.Service;

import com.example.metamorph.common.entity.JobStatus;
import com.example.metamorph.common.repository.JobRepository;

@Service 
public class JobService {
    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository){
        this.jobRepository = jobRepository;
    }

    public boolean validJobStatusTransition(JobStatus initialStatus, JobStatus finalStatus){
        return isValidJobStatusTransition(initialStatus, finalStatus);
    }

    private boolean isValidJobStatusTransition(JobStatus initialStatus, JobStatus finalStatus){
        if(initialStatus == null || finalStatus == null) return false;
        if(initialStatus == finalStatus) return true;
        return switch(initialStatus){
            case PENDING ->
                finalStatus == JobStatus.PROCESSING;
            case PROCESSING ->
                finalStatus == JobStatus.COMPLETED || finalStatus == JobStatus.FAILED;
            case COMPLETED, FAILED ->
                false;
        };
    }
}
