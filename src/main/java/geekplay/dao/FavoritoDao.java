package geekplay.dao;

import org.hibernate.Hibernate;
import org.hibernate.Session;
import org.hibernate.Transaction;

import geekplay.model.Favorito;
import geekplay.util.HibernateUtil;

public class FavoritoDao {
    public void favoritar(Favorito favorito){
         Transaction transaction = null;
         try (Session session= HibernateUtil.getSessionFactory().openSession()) {
            transaction=session.beginTransaction();
            session.persist(favorito);
         } catch (Exception e) {
            // TODO: handle exception
         }
    }
}
