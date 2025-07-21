package geekplay.util;

import org.hibernate.SessionFactory;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HibernateUtil {
    private static final Logger logger = LoggerFactory.getLogger(HibernateUtil.class);

    // Configurações fixas para MySQL
    private static final String DRIVER = "com.mysql.cj.jdbc.Driver";
    private static final String DIALECT = "org.hibernate.dialect.MySQLDialect";
    private static final String URL = "jdbc:mysql://localhost:3307/filme";
    private static final String USER = "root";
    private static final String PASSWORD = "senac";

    private static SessionFactory sessionFactory;

    static {
        try {
            sessionFactory = buildSessionFactory();
            logger.info("SessionFactory criada com sucesso!");
        } catch (Exception e) {
            logger.error("Falha na inicialização do Hibernate", e);
            throw new ExceptionInInitializerError(e);
        }
    }

    private static SessionFactory buildSessionFactory() {
        logger.info("Configurando conexão com MySQL...");

        StandardServiceRegistry registry = new StandardServiceRegistryBuilder()
                .configure() // Carrega o hibernate.cfg.xml
                .applySetting("hibernate.connection.driver_class", DRIVER)
                .applySetting("hibernate.connection.url", URL)
                .applySetting("hibernate.connection.username", USER)
                .applySetting("hibernate.connection.password", PASSWORD)
                .applySetting("hibernate.dialect", DIALECT)
                .build();

        try {
            SessionFactory factory = new MetadataSources(registry)
                    .buildMetadata()
                    .buildSessionFactory();

            logger.info("Conexão com MySQL estabelecida com sucesso.");
            return factory;

        } catch (Exception e) {
            logger.error("Erro ao construir SessionFactory", e);
            StandardServiceRegistryBuilder.destroy(registry);
            throw new ExceptionInInitializerError(e);
        }
    }

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public static void shutdown() {
        if (sessionFactory != null && !sessionFactory.isClosed()) {
            logger.info("Encerrando conexões com o banco de dados...");
            sessionFactory.close();
        }
    }
}
