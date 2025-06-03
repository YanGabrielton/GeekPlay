package geekplay.model;

import jakarta.persistence.*;

@Entity
@Table(name = "favoritos")
public class Favorito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_favorito")
    private int id;
    
    @ManyToOne
    @JoinColumn(name = "usuario", nullable = false)
    private Usuario usuario;
    
    @Column(name = "id_api", nullable = false, length = 50)
    private String idApi;
    
    
    @Column(name = "tipo_item", nullable = false, length = 30)
    private String tipoItem;
    
    @Column(nullable = false, length = 255)
    private String titulo;
    
    // Construtores, getters e setters
    public Favorito() {}
    
    public Favorito(Usuario usuario, String idApi, String tipoItem, String titulo) {
        this.usuario = usuario;
        this.idApi = idApi;
        this.tipoItem = tipoItem;
        this.titulo = titulo;
    }
    
    // Getters e Setters
    public int getId() { 
        return id;
     }
    public void setId(int id) { 
        this.id = id;
     }
    public Usuario getUsuario() {
         return usuario; 
        }
    public void setUsuario(Usuario usuario) {
         this.usuario = usuario;
         }
    public String getIdApi() {
         return idApi; 
        }
    public void setIdApi(String idApi) {
         this.idApi = idApi; 
        }
    public String getTipoItem() { 
        return tipoItem; 
    }
    public void setTipoItem(String tipoItem) {
         this.tipoItem = tipoItem; 
        }
    public String getTitulo() {
         return titulo; 
        }
    public void setTitulo(String titulo) {
         this.titulo = titulo;
         }
}

// enum TipoItem {
//     ANIME, MANGA, FILME
// }