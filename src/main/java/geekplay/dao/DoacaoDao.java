package geekplay.dao;


import org.hibernate.Session;
import org.hibernate.Transaction;


import geekplay.util.HibernateUtil;
import geekplay.model.Doacao;
import java.math.BigDecimal;

import java.util.List;

public class DoacaoDao {
    public void registrarDoacao(Doacao doacao) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.persist(doacao);
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            throw e;
        }
    }

    public List<Doacao> listarDoacoesPorUsuario(int usuarioId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery(
                "FROM Doacao WHERE usuario.id = :usuarioId ORDER BY dataDoacao DESC", 
                Doacao.class)
                .setParameter("usuarioId", usuarioId)
                .list();
        }
    }

    public BigDecimal totalDoacoes() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery(
                "SELECT SUM(valor) FROM Doacao", 
                BigDecimal.class)
                .uniqueResult();
        }
    }
}