package com.workforce.management.dto;

import lombok.Getter;

@Getter
public class JwtAuthResponse {

    private String accessToken;

    private String tokenType = "Bearer";

    public JwtAuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}