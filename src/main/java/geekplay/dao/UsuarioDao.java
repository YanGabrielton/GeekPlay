package geekplay.dao;

import geekplay.model.Usuario;
import geekplay.util.HibernateUtil;

import org.hibernate.Session;
import org.hibernate.Transaction;
import java.util.List;

public class UsuarioDao {
    public void salvar(Usuario usuario) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = session.beginTransaction();
            session.persist(usuario);
            tx.commit();
        }
    }
    
    public Usuario buscarPorId(int id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.find(Usuario.class, id);
        }
    }
    
    public List<Usuario> listarTodos() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("from Usuario", Usuario.class).list();
        }
    }
}