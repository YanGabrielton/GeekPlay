package geekplay.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

@StaticMetamodel(Favorito.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class Favorito_ {

	
	/**
	 * @see geekplay.model.Favorito#tipoItem
	 **/
	public static volatile SingularAttribute<Favorito, String> tipoItem;
	
	/**
	 * @see geekplay.model.Favorito#idApi
	 **/
	public static volatile SingularAttribute<Favorito, String> idApi;
	
	/**
	 * @see geekplay.model.Favorito#titulo
	 **/
	public static volatile SingularAttribute<Favorito, String> titulo;
	
	/**
	 * @see geekplay.model.Favorito#usuario
	 **/
	public static volatile SingularAttribute<Favorito, Usuario> usuario;
	
	/**
	 * @see geekplay.model.Favorito#id
	 **/
	public static volatile SingularAttribute<Favorito, Integer> id;
	
	/**
	 * @see geekplay.model.Favorito
	 **/
	public static volatile EntityType<Favorito> class_;

	public static final String TIPO_ITEM = "tipoItem";
	public static final String ID_API = "idApi";
	public static final String TITULO = "titulo";
	public static final String USUARIO = "usuario";
	public static final String ID = "id";

}

