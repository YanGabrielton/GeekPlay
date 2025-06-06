package geekplay.util;

import java.security.Key;
import java.util.Date;

import io.jsonwebtoken.Claims; // Import adicionado
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {
    // Chave secreta para assinar os tokens (gerada automaticamente)
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    // Tempo de expiração do token (24 horas em milissegundos)
    private static final long EXPIRATION_TIME = 86400000;

    // Gera um token JWT contendo email e userId
    public static String generateToken(String email, Integer userId) {
        return Jwts.builder()
                .setSubject(email) // Define o assunto (normalmente o email)
                .claim("userId", userId) // Adiciona claim personalizada
                .setIssuedAt(new Date()) // Data de emissão
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Data de expiração
                .signWith(SECRET_KEY) // Assina com a chave secreta
                .compact(); // Converte para string
    }

    // Valida um token JWT
    public static boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(SECRET_KEY) // Define a chave de verificação
                .build() // Constrói o parser
                .parseClaimsJws(token); // Faz o parsing e validação
            return true;
        } catch (Exception e) {
            return false; // Token inválido ou expirado
        }
    }

    // Extrai o email do token
    public static String getEmailFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token) // Parsing do token
                .getBody() // Obtém o payload (claims)
                .getSubject(); // Obtém o subject (email)
    }

    // Extrai o userId do token
    public static Integer getUserIdFromToken(String token) {
        Claims claims = Jwts.parser() // Inicia construção do parser
                .setSigningKey(SECRET_KEY) // Configura chave de assinatura
                .build() // Finaliza construção
                .parseClaimsJws(token) // Faz parsing e validação
                .getBody(); // Obtém o payload
        
        return claims.get("userId", Integer.class); // Obtém claim personalizada
    }
}