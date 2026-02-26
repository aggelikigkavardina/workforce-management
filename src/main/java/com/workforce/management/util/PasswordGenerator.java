package com.workforce.management.util;

import java.security.SecureRandom;

public class PasswordGenerator {

    private static final SecureRandom RNG = new SecureRandom();

    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    public static String genarate(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(RNG.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
