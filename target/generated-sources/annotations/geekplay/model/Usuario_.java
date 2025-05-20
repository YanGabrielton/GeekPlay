package geekplay.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.ListAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

@StaticMetamodel(Usuario.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class Usuario_ {

	
	/**
	 * @see geekplay.model.Usuario#senha
	 **/
	public static volatile SingularAttribute<Usuario, String> senha;
	
	/**
	 * @see geekplay.model.Usuario#nome
	 **/
	public static volatile SingularAttribute<Usuario, String> nome;
	
	/**
	 * @see geekplay.model.Usuario#favoritos
	 **/
	public static volatile ListAttribute<Usuario, Favorito> favoritos;
	
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
	
	/**
	 * @see geekplay.model.Usuario#doacoes
	 **/
	public static volatile ListAttribute<Usuario, Doacao> doacoes;
	
	/**
	 * @see geekplay.model.Usuario#status
	 **/
	public static volatile SingularAttribute<Usuario, Character> status;

	public static final String SENHA = "senha";
	public static final String NOME = "nome";
	public static final String FAVORITOS = "favoritos";
	public static final String ID = "id";
	public static final String EMAIL = "email";
	public static final String DOACOES = "doacoes";
	public static final String STATUS = "status";

}

