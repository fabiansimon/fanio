package com.fabiansimon.fanio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**") // Adjust this to be more specific if needed
//                .allowedOrigins("http://localhost:3000") // Adjust according to your client URL
//                .allowedMethods("GET", "POST", "PUT", "DELETE", "HEAD")
//                .allowCredentials(true);

        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
