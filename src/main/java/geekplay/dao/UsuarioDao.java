package geekplay.dao;

import geekplay.model.Usuario;
import geekplay.util.HibernateUtil;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class UsuarioDao {
      private static final Logger logger = LoggerFactory.getLogger(HibernateUtil.class);
    // Método para salvar um usuário
    public void salvar(Usuario usuario) {
        Transaction transaction = null;
        Session session = null;

        try {
            session = HibernateUtil.getSessionFactory().openSession();
            transaction = session.beginTransaction();
                
            session.persist(usuario); // salva o usuário
             logger.info("Usuario salvo com sucesso: {}", usuario.getNome());
            transaction.commit(); // commita com segurança

        } catch (Exception e) {
            if (transaction != null && transaction.getStatus().canRollback()) {
                transaction.rollback();
            }
            throw e; // propaga o erro corretamente
        } finally {
            if (session != null && session.isOpen()) {
                session.close(); // fecha somente depois de tudo
            }
        }
    }

  public boolean emailExiste(String email) {
    try (Session session = HibernateUtil.getSessionFactory().openSession()) {
        List<Usuario> resultados = session.createQuery(
                "from Usuario where email = :email", Usuario.class)
                .setParameter("email", email)
                .getResultList();

        logger.info("Verificando se o email existe: {}", email);

        return !resultados.isEmpty();
    }
}

public boolean nomeExiste(String nome) {
    try (Session session = HibernateUtil.getSessionFactory().openSession()) {
        List<Usuario> resultados = session.createQuery(
                "from Usuario where nome = :nome", Usuario.class)
                .setParameter("nome", nome)
                .getResultList();

        logger.info("Verificando se o nome existe: {}", nome);

        return !resultados.isEmpty();
    }
}


   public void atualizar(Usuario usuario) {
    Transaction tx = null;
    try (Session session = HibernateUtil.getSessionFactory().openSession()) {
          logger.info("Dados Antes de  Atualizar: {}", usuario.getNome(),usuario.getEmail(),usuario.getStatus());
        tx = session.beginTransaction();
        session.merge(usuario); // ✅ CORRETO em Hibernate 6.x
        logger.info("Dados Depois de Atualizar: {}", usuario.getNome(),usuario.getEmail(),usuario.getStatus());
         // Atualiza o usuário
        tx.commit();
       
    } catch (Exception e) {
        if (tx != null) tx.rollback();
        throw e;
    }
}




    public Usuario verificarLogin(String email, String senha) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery(
                    "FROM Usuario WHERE email = :email AND senha = :senha ",
                    Usuario.class)
                    .setParameter("email", email)
                    .setParameter("senha", senha)
                    .uniqueResult();

        }
    }

    // Método para verificar email duplicado
    public boolean existeEmail(String email) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery(
                    "SELECT COUNT(u) > 0 FROM Usuario u WHERE email = :email",
                    Boolean.class)
                    .setParameter("email", email)
                    .uniqueResult();
        }
    }

    public Usuario buscarPorEmail(String email) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery(
                    "FROM Usuario WHERE email = :email", Usuario.class)
                    .setParameter("email", email)
                    .uniqueResult();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar usuário por email", e);
        }
    }

    public Usuario buscarPorId(int id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.find(Usuario.class, id);
        }
    }

    public List<Usuario> listarTodos() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("FROM Usuario", Usuario.class).list();
        }
    }

    public void atualizarSenha(String email, String novaSenha) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();

            // Busca o usuário por email
            Usuario usuario = session.createQuery(
                    "FROM Usuario WHERE email = :email", Usuario.class)
                    .setParameter("email", email)
                    .uniqueResult();

            if (usuario != null) {
                // Atualiza apenas a senha (em produção, criptografe antes!)
                usuario.setSenha(novaSenha);
                session.merge(usuario); // Usamos merge para atualização
            }

            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            throw new RuntimeException("Erro ao atualizar senha", e);
        }
    }

}
