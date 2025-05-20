package geekplay.dao;

import geekplay.model.Usuario;
import geekplay.util.HibernateUtil;

import org.hibernate.Session;
import org.hibernate.Transaction;
import java.util.List;

public class UsuarioDao {
    public void salvar(Usuario usuario) {
      //   Transaction tx = connection.beginTransaction(); porem eu fiz dessa forma abaixo
      Transaction transaction = null;
        try (Session connection = HibernateUtil.getSessionFactory().openSession()) {//Uma Session do Hibernate representa a "conversa" com o banco
        transaction = connection.beginTransaction(); //	Começa uma transação (como no SQL: BEGIN)
            connection.persist(usuario); //Insere o objeto usuario no banco (INSERT INTO usuario (...))
            transaction.commit(); //Finaliza a transação
        }catch (Exception e) {
            if (transaction != null) transaction.rollback(); //Se der erro, desfaz a transação (evita dados errados no banco)
            throw e;
        }
    }
    
    public Usuario buscarPorId(int id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.find(Usuario.class, id); //É o equivalente a SELECT * FROM usuario WHERE id = ...
        }
    }
    
    public List<Usuario> listarTodos() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("from Usuario", Usuario.class).list();
        }
    }
}