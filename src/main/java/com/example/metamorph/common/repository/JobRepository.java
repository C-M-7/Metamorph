package com.example.metamorph.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.metamorph.common.entity.Job;

@Repository 
public interface JobRepository extends JpaRepository<Job, Long>{

}
