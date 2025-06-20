package geekplay.dao;

import java.util.List;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import geekplay.model.Favorito;
import geekplay.util.HibernateUtil;

public class FavoritoDao {
    
    public void favoritar(Favorito favorito) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.persist(favorito);
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            throw e;
        }
    }

    public List<Favorito> listarPorUsuario(int usuarioId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Favorito> query = session.createQuery(
                "FROM Favorito f WHERE f.usuario.id = :usuarioId", Favorito.class);
            query.setParameter("usuarioId", usuarioId);
            return query.list();
        }
    }

    public List<Favorito> listarPorUsuarioETipo(int usuarioId, String tipoItem) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Favorito> query = session.createQuery(
                "FROM Favorito f WHERE f.usuario.id = :usuarioId AND f.tipoItem = :tipoItem", 
                Favorito.class);
            query.setParameter("usuarioId", usuarioId);
            query.setParameter("tipoItem", tipoItem);
            return query.list();
        }
    }

    public boolean removerFavorito(int usuarioId, String idApi, String tipoItem) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            
            Query<?> query = session.createQuery(
                "DELETE FROM Favorito f WHERE f.usuario.id = :usuarioId " +
                "AND f.idApi = :idApi AND f.tipoItem = :tipoItem");
            query.setParameter("usuarioId", usuarioId);
            query.setParameter("idApi", idApi);
            query.setParameter("tipoItem", tipoItem);
            
            int deleted = query.executeUpdate();
            transaction.commit();
            return deleted > 0;
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            throw e;
        }
    }
    
    public boolean isFavorito(int usuarioId, String idApi, String tipoItem) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Query<Long> query = session.createQuery(
                "SELECT COUNT(f) FROM Favorito f WHERE " +
                "f.usuario.id = :usuarioId AND f.idApi = :idApi AND f.tipoItem = :tipoItem", 
                Long.class);
            
            query.setParameter("usuarioId", usuarioId);
            query.setParameter("idApi", idApi);
            query.setParameter("tipoItem", tipoItem);
            
            Long count = query.uniqueResult();
            return count != null && count > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public void removerFavoritosPorUsuario(int usuarioId) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            Query<?> query = session.createQuery(
                "DELETE FROM Favorito f WHERE f.usuario.id = :usuarioId");
            query.setParameter("usuarioId", usuarioId);
            query.executeUpdate();
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            throw e;
        }
    }
}