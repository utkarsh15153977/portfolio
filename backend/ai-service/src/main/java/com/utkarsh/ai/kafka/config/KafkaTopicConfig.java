package com.utkarsh.ai.kafka.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${ai.kafka.topics.requests:ai.chat.requests}")
    private String requestsTopic;

    @Value("${ai.kafka.topics.responses:ai.chat.responses}")
    private String responsesTopic;

    @Value("${ai.kafka.topics.dlq:ai.chat.dlq}")
    private String dlqTopic;

    @Bean
    public NewTopic requestsTopic() {
        return TopicBuilder.name(requestsTopic)
                .partitions(6)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic responsesTopic() {
        return TopicBuilder.name(responsesTopic)
                .partitions(6)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic dlqTopic() {
        return TopicBuilder.name(dlqTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
