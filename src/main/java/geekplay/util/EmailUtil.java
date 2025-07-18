package geekplay.util;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Properties;

public class EmailUtil {

    private static final String REMETENTE = "suportegekplay@gmail.com";
    private static final String SENHA_APP = "theo bqbl eqjt slyx"; // Senha de 16 dígitos do Gmail
    private static final Logger logger = LoggerFactory.getLogger(EmailUtil.class);

 public static void enviarEmail(String destinatario, String assunto, String corpo) {
		new Thread(() -> {
			Properties props = new Properties();
			props.put("mail.smtp.host", "smtp.gmail.com");
			props.put("mail.smtp.port", "587");
			props.put("mail.smtp.auth", "true");
			props.put("mail.smtp.starttls.enable", "true");
			props.put("mail.smtp.ssl.protocols", "TLSv1.2");

			Session session = Session.getInstance(props, new Authenticator() {
				@Override
				protected PasswordAuthentication getPasswordAuthentication() {
					return new PasswordAuthentication(REMETENTE, SENHA_APP);
				}
			});

			try {
				Message message = new MimeMessage(session);
				message.setFrom(new InternetAddress(REMETENTE));
				message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatario));
				message.setSubject(assunto);
				message.setText(corpo);

				Transport.send(message);
				logger.info("✅ E-mail enviado para: {}", destinatario);
			} catch (MessagingException e) {
				logger.error("❌ Falha ao enviar e-mail", e);
				throw new RuntimeException("Erro ao enviar e-mail: " + e.getMessage(), e);
			}
		}).start();

	}
}
