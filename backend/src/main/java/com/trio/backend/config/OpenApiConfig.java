package com.trio.backend.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI collabixOpenAPI() {

        return new OpenAPI()

                .info(new Info()

                        .title("Collabix API")

                        .description("REST API for the Collabix collaborative workspace platform.")

                        .version("1.0.0")

                        .contact(new Contact()
                                .name("Trio")
                                .email("contact@collabix.local"))

                        .license(new License()
                                .name("Private Project")))

                .externalDocs(new ExternalDocumentation()

                        .description("Project Documentation"));
    }

}