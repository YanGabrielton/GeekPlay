package geekplay.util;

import org.hibernate.SessionFactory;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HibernateUtil {
    // Logger para registro de atividades
    private static final Logger logger = LoggerFactory.getLogger(HibernateUtil.class);
    
    // Configurações para MySQL
    private static final String MYSQL_DRIVER = "com.mysql.cj.jdbc.Driver";
    private static final String MYSQL_DIALECT = "org.hibernate.dialect.MySQL8Dialect";
    
    // Configurações para MariaDB
    private static final String MARIADB_DRIVER = "org.mariadb.jdbc.Driver";
    private static final String MARIADB_DIALECT = "org.hibernate.dialect.MariaDB103Dialect";
    
    private static SessionFactory sessionFactory;
    private static boolean usingMariaDB;

    // Bloco estático para inicialização automática
    static {
        try {
            sessionFactory = buildSessionFactory(detectDatabaseType());
        } catch (Exception e) {
            logger.error("Falha catastrófica na inicialização", e);
            throw new ExceptionInInitializerError(e);
        }
    }

    /**
     * Detecta automaticamente o ambiente com base no nome do computador
     * @return true para MariaDB (casa), false para MySQL (curso)
     */
    private static boolean detectDatabaseType() {
        // Passo 1: Obter nome do computador
        String hostname = System.getenv().getOrDefault("L05023964", // Windows
                          System.getenv().getOrDefault("HOSTNAME", "")); // Linux/Mac
        
        // Passo 2: Comparar com o nome do PC em casa
        boolean isHome = hostname.equalsIgnoreCase("AsRok"); // Substitua pelo seu nome do computador!
        
        // Passo 3: Registrar descoberta
        logger.debug("Hostname detectado: {} → {}", hostname, 
            isHome ? "CASA (MariaDB)" : "CURSO (MySQL)");
        
        return isHome;
    }

    /**
     * Constrói a SessionFactory com base no banco detectado
     * @param useMariaDB true para MariaDB, false para MySQL
     */
    private static SessionFactory buildSessionFactory(boolean useMariaDB) {
        logger.info("Configurando para {}...", useMariaDB ? "MariaDB" : "MySQL");
        
        // Definir configurações dinâmicas
        String driver = useMariaDB ? MARIADB_DRIVER : MYSQL_DRIVER;
        String dialect = useMariaDB ? MARIADB_DIALECT : MYSQL_DIALECT;
        String url = useMariaDB ? 
            "jdbc:mariadb://localhost:3306/filme" : 
            "jdbc:mysql://localhost:3306/filme";

        // Construir registro de serviços
        StandardServiceRegistry registry = new StandardServiceRegistryBuilder()
            .configure() // Carrega hibernate.cfg.xml
            .applySetting("hibernate.connection.driver_class", driver)
            .applySetting("hibernate.dialect", dialect)
            .applySetting("hibernate.connection.url", url)
            .build();

        try {
            SessionFactory factory = new MetadataSources(registry)
                .buildMetadata()
                .buildSessionFactory();
            
            logger.info("Conexão estabelecida com sucesso!");
            return factory;
            
        } catch (Exception e) {
            logger.error("Falha na conexão com o banco", e);
            StandardServiceRegistryBuilder.destroy(registry);
            throw new ExceptionInInitializerError(e);
        }
    }

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public static void shutdown() {
        if (sessionFactory != null) {
            logger.info("Encerrando conexões...");
            sessionFactory.close();
        }
    }
}