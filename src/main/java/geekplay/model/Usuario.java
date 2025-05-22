package geekplay.model;

import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private int id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false, unique = true, length = 30)
    private String nome;
    
    @Column(nullable = false, length = 255)
    private String senha;
    
    @Column(name = "statusL", columnDefinition = "CHAR(1) DEFAULT 'A'")
    private Character status;
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Favorito> favoritos;
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Doacao> doacoes;
    
    
    // Construtores, getters e setters
    public Usuario() {}
    
    public Usuario(String email, String nome, String senha) {
        this.email = email;
        this.nome = nome;
        this.senha = senha;
        this.status = 'A';
    }
    
    // Getters e Setters
    public int getId() {
         return id; 
        }
    public void setId(int id) { 
        this.id = id;
     }
    public String getEmail() { 
        return email;
     }
    public void setEmail(String email) {
         this.email = email; 
        }
    public String getNome() {
         return nome;
         }
    public void setNome(String nome) { 
        this.nome = nome;
     }
    public String getSenha() {
         return senha; 
        }
    public void setSenha(String senha) { 
        this.senha = senha; 
    }
    public char getStatus() { 
        return status; 
    }
    public void setStatus(char status) { 
        this.status = status;
     }
    public List<Favorito> getFavoritos() { 
        return favoritos; 
    }
    public void setFavoritos(List<Favorito> favoritos) { 
        this.favoritos = favoritos;
     }
    public List<Doacao> getDoacoes() { 
        return doacoes; 
    }
    public void setDoacoes(List<Doacao> doacoes) {
         this.doacoes = doacoes;
         }
         
}