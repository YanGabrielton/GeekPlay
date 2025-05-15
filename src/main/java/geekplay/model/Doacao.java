package geekplay.model;

import jakarta.persistence.*;
import java.math.BigDecimal; // Import adicionado
import java.time.LocalDateTime;

@Entity
@Table(name = "doacoes")
public class Doacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_doacao")
    private int id;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor; // Alterado de double para BigDecimal
    
    @Column(name = "data_doacao", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime dataDoacao;
    
    @ManyToOne
    @JoinColumn(name = "usuario")
    private Usuario usuario;
    
    // Construtores
    public Doacao() {}
    
    public Doacao(BigDecimal valor, Usuario usuario) { // Atualizado para BigDecimal
        this.valor = valor;
        this.usuario = usuario;
        this.dataDoacao = LocalDateTime.now();
    }
    
    public Doacao(BigDecimal valor) { // Atualizado para BigDecimal
        this.valor = valor;
        this.dataDoacao = LocalDateTime.now();
    }
    
    // Getters e Setters
    public int getId() { 
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public BigDecimal getValor() { // Retorno alterado para BigDecimal
        return valor;
    }
    
    public void setValor(BigDecimal valor) { // Parâmetro alterado para BigDecimal
        this.valor = valor;
    }
    
    public LocalDateTime getDataDoacao() {
        return dataDoacao;
    }
    
    public void setDataDoacao(LocalDateTime dataDoacao) {
        this.dataDoacao = dataDoacao;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}