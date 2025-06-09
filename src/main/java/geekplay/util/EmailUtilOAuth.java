package geekplay.util;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
// import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
// import com.google.api.client.http.javanet.NetHttpTransport;
// import com.google.api.client.json.gson.GsonFactory;
// import com.google.api.services.gmail.Gmail;
import jakarta.mail.*;
import jakarta.mail.internet.*;

import java.io.FileInputStream;
import java.util.Collections;
import java.util.Properties;

public class EmailUtilOAuth {
    private static final String REMETENTE = "seuEmail@gmail.com"; // Seu e-mail Gmail

    public static void enviarEmail(String destinatario, String assunto, String corpo) throws Exception {
        // 1. Carrega as credenciais OAuth 2.0
        GoogleCredential credential = GoogleCredential.fromStream(
                new FileInputStream("src/main/resources/credentials.json"))
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/gmail.send"));

        // 2. Gera um token de acesso
        credential.refreshToken();

        // 3. Configura o SMTP
        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        // 4. Cria a sessão e a mensagem
        Session session = Session.getInstance(props);
        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(REMETENTE));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatario));
        message.setSubject(assunto);
        message.setText(corpo);

        // 5. Envia o e-mail usando OAuth 2.0
        Transport transport = session.getTransport("smtp");
        transport.connect("smtp.gmail.com", REMETENTE, credential.getAccessToken());
        transport.sendMessage(message, message.getAllRecipients());
        transport.close();

        System.out.println("E-mail enviado para: " + destinatario);
    }
}