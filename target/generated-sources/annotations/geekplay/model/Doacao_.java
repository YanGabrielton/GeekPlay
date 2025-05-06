package geekplay.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.LocalDateTime;

@StaticMetamodel(Doacao.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class Doacao_ {

	
	/**
	 * @see geekplay.model.Doacao#dataDoacao
	 **/
	public static volatile SingularAttribute<Doacao, LocalDateTime> dataDoacao;
	
	/**
	 * @see geekplay.model.Doacao#valor
	 **/
	public static volatile SingularAttribute<Doacao, Double> valor;
	
	/**
	 * @see geekplay.model.Doacao#usuario
	 **/
	public static volatile SingularAttribute<Doacao, Usuario> usuario;
	
	/**
	 * @see geekplay.model.Doacao#id
	 **/
	public static volatile SingularAttribute<Doacao, Integer> id;
	
	/**
	 * @see geekplay.model.Doacao
	 **/
	public static volatile EntityType<Doacao> class_;

	public static final String DATA_DOACAO = "dataDoacao";
	public static final String VALOR = "valor";
	public static final String USUARIO = "usuario";
	public static final String ID = "id";

}

