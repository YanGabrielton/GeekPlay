package geekplay.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Database {
    private static final String JDBC_URL = "jdbc:mysql://localhost:3306/seu_banco_de_dados";
    private static final String USER = "seu_usuario";
    private static final String PASSWORD = "sua_senha";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
    }

    public static void closeConnection(Connection connection) {
        if (connection!= null) {
            try {
                connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}