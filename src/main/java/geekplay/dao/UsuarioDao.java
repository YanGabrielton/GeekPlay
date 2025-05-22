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

    public void deletar(int id) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();  
            // 1. Busca o usuário pelo ID
            Usuario usuario = session.find(Usuario.class, id);
            if (usuario != null) {
                // 2. Remove o usuário do banco
                session.remove(usuario);
            }
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) {
                transaction.rollback();
            }
            throw e;
        }
    }


    public Usuario verificarLogin(String email,String senha){
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("from usuario u where u.email = :email AND u.senha= :senha",Usuario.class)
            .setParameter("email", email)
            .setParameter("senha", senha)
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
 
}
