package geekplay.dao;


import java.util.List;

import org.hibernate.Session;
import org.hibernate.Transaction;

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
            return session.createQuery(
                "FROM Favorito WHERE usuario.id = :usuarioId", Favorito.class)
                .setParameter("usuarioId", usuarioId)
                .list();
        }
    }

    public boolean removerFavorito(int usuarioId, String idApi, String tipoItem) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            
            int deleted = session.createQuery(
                "DELETE FROM Favorito WHERE usuario.id = :usuarioId " +
                "AND idApi = :idApi AND tipoItem = :tipoItem")
                .setParameter("usuarioId", usuarioId)
                .setParameter("idApi", idApi)
                .setParameter("tipoItem", tipoItem)
                .executeUpdate();
                
            transaction.commit();
            return deleted > 0;
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            throw e;
        }
    }
    
}
