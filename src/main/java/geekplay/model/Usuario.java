package geekplay.model;

import jakarta.persistence.*;
import java.util.List;
@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private int id;

     
    @Column(nullable = false, unique = true, length = 45)
    private String email;

    @Column(nullable = false,unique = true,length = 12)
    private String nome;
}
