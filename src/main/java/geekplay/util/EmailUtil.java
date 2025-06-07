package geekplay.util;

import java.util.Properties;
import jakarta.mail.*; // Corrigido: usar jakarta.mail (versão mais nova)
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

public class EmailUtil {
    // Configurações do remetente (substitua com seus dados)
    private static final String REMETENTE = "suporteGeekPlay@gmail.com";
    private static final String SENHA = "sua-senha-de-app"; // Senha de app do Gmail

    public static void enviarEmail(String destinatario, String assunto, String corpo) {
        // Configura propriedades do servidor SMTP
        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com"); // Servidor do Gmail
        props.put("mail.smtp.port", "587"); // Porta para TLS
        props.put("mail.smtp.auth", "true"); // Requer autenticação
        props.put("mail.smtp.starttls.enable", "true"); // Habilita TLS

        // Cria sessão com autenticação
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(REMETENTE, SENHA);
            }
        });

        try {
            // Cria mensagem de e-mail
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(REMETENTE)); // Remetente
            message.setRecipients(
                Message.RecipientType.TO,
                InternetAddress.parse(destinatario) // Destinatário(s)
            );
            message.setSubject(assunto); // Assunto
            message.setText(corpo); // Corpo do e-mail

            // Envia o e-mail
            Transport.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Falha ao enviar e-mail: " + e.getMessage());
        }
    }
}