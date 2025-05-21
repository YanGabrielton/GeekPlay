package geekplay.dao;

import geekplay.model.Usuario;
import geekplay.util.HibernateUtil;

import org.hibernate.Session;
import org.hibernate.Transaction;
import java.util.List;

public class UsuarioDao {
    // Método para salvar um usuário
    public void salvar(Usuario usuario) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.persist(usuario);
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            throw e;
        }
    }


    public Usuario buscarPorEmail(String email) {
        if (email == null || email.trim().isEmpty()) return null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("FROM Usuario WHERE email = :email", Usuario.class)
                .setParameter("email", email.trim().toLowerCase())
                .uniqueResult();
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

    public boolean existePorEmail(String email) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Long count = session.createQuery("SELECT COUNT(u) FROM Usuario u WHERE email = :email", Long.class)
                .setParameter("email", email.trim().toLowerCase())
                .uniqueResult();
            return count != null && count > 0;
        }
    }
    
}
