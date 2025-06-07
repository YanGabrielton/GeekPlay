package geekplay.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.util.Date;

public class JwtUtil {
    
    // Chave secreta segura (256 bits) gerada automaticamente
    // - Keys.secretKeyFor() gera uma chave criptograficamente forte
    // - SignatureAlgorithm.HS256 especifica o algoritmo HMAC-SHA256
    private static final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Tempo de expiração do token (24 horas em milissegundos)
    private static final long EXPIRATION_TIME = 86400000;

    // Geração de token JWT
    public static String generateToken(String email) {
        return Jwts.builder()                  // Inicia a construção do token
            .setSubject(email)                 // Define o assunto (normalmente o identificador do usuário)
            .setExpiration(new Date(            // Define a data de expiração
                System.currentTimeMillis() + EXPIRATION_TIME
            ))
            .signWith(SECRET_KEY)              // Assina o token com a chave secreta
            .compact();                        // Converte para string compacta
    }

    public static String generateTokenRecovery(String email, long expirationTime) {
        return Jwts.builder()                  // Inicia a construção do token
            .setSubject(email)                 // Define o assunto (normalmente o identificador do usuário)
            .setExpiration(new Date(            // Define a data de expiração personalizada
                System.currentTimeMillis() + expirationTime
            ))
            .signWith(SECRET_KEY)              
            .compact();                        // Converte para string compacta
    }

    // Validação do token
    public static boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()              // Inicia o parser (analisador)
                .setSigningKey(SECRET_KEY)    // Define a chave de verificação
                .build()                      // Constrói o parser
                .parseClaimsJws(token);       // Analisa e valida o token
            return true;                      // Retorna true se válido
        } catch (JwtException e) {
            return false;                     // Retorna false se inválido
        }
    }

    // Extração de dados do token
    public static String getEmailFromToken(String token) {
        return Jwts.parserBuilder()           // Inicia o parser
            .setSigningKey(SECRET_KEY)        // Define a chave de verificação
            .build()                          // Constrói o parser
            .parseClaimsJws(token)            // Analisa o token
            .getBody()                        // Obtém o corpo (payload) do token
            .getSubject();                    // Obtém o assunto (email)
    }
}