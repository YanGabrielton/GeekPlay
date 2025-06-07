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


    public Usuario verificarLogin(String email, String senha) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery(
                "FROM Usuario WHERE email = :email AND senha = :senha AND status = 'A'", 
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
    Transaction transaction = null;
    try (Session session = HibernateUtil.getSessionFactory().openSession()) {
        transaction = session.beginTransaction();
        
        Usuario usuario = session.createQuery(
            "FROM Usuario WHERE email = :email", Usuario.class)
            .setParameter("email", email)
            .uniqueResult();
        
        transaction.commit();
        return usuario;
        
    } catch (Exception e) {
        if (transaction != null) {
            transaction.rollback();
        }
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
