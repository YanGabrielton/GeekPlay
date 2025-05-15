package geekplay.util;

import org.hibernate.SessionFactory;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;

public class HibernateUtil {
    private static final SessionFactory sessionFactory = buildSessionFactory();

    private static SessionFactory buildSessionFactory() {
        final StandardServiceRegistry registry = new StandardServiceRegistryBuilder()
                .configure() // Carrega hibernate.cfg.xml
                   // no caso no meu mysqlWorkBench ele mostra como MariaDB103Dialect SELECT VERSION();
                   .applySetting("hibernate.dialect", "org.hibernate.dialect.MySQL8Dialect")
                   .applySetting("hibernate.connection.driver_class", "com.mysql.cj.jdbc.Driver")
                     .build();
                   
                   
        try {
            return new MetadataSources(registry)
                    .buildMetadata()
                    .buildSessionFactory();
        } catch (Exception e) {
            StandardServiceRegistryBuilder.destroy(registry);
            throw new ExceptionInInitializerError(e);
        }
    }

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public static void shutdown() {
        getSessionFactory().close();
    }
} 