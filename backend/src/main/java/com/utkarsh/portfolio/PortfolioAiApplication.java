package com.utkarsh.portfolio;

import com.utkarsh.portfolio.config.PortfolioAgentProperties;
import com.utkarsh.portfolio.config.PortfolioAiProperties;
import com.utkarsh.portfolio.config.PortfolioRagProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({PortfolioAiProperties.class, PortfolioRagProperties.class,
        PortfolioAgentProperties.class})
public class PortfolioAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortfolioAiApplication.class, args);
    }
}
