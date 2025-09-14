package com.homeputers.ebal2.api.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.homeputers.ebal2.api")
public class MyBatisConfig {
}

