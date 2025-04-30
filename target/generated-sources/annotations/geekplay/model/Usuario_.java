package geekplay.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

@StaticMetamodel(Usuario.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class Usuario_ {

	
	/**
	 * @see geekplay.model.Usuario#nome
	 **/
	public static volatile SingularAttribute<Usuario, String> nome;
	
	/**
	 * @see geekplay.model.Usuario#id
	 **/
	public static volatile SingularAttribute<Usuario, Integer> id;
	
	/**
	 * @see geekplay.model.Usuario
	 **/
	public static volatile EntityType<Usuario> class_;
	
	/**
	 * @see geekplay.model.Usuario#email
	 **/
	public static volatile SingularAttribute<Usuario, String> email;

	public static final String NOME = "nome";
	public static final String ID = "id";
	public static final String EMAIL = "email";

}

