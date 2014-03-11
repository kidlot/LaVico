package com.rest;

import javax.ws.rs.ApplicationPath;

import org.codehaus.jackson.jaxrs.JacksonJsonProvider;
import org.glassfish.jersey.filter.LoggingFilter;
import org.glassfish.jersey.server.ResourceConfig;

@ApplicationPath("/")
public class Application extends ResourceConfig{

    public Application() {
    	
        packages("com.rest.resource");
        //注册JSON转换器
        register(JacksonJsonProvider.class);
        register(LoggingFilter.class);
    }
}
