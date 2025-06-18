package geekplay.dto;

public class VerificarLoginDTO {
    private String email;
    private String senha;

    // Construtor vazio necessário para desserialização
    public VerificarLoginDTO() {
    }
    // Getters e Setters
    public String getEmail() {
        return email;
    }       
    public void setEmail(String email) {
        this.email = email;
    }
    public String getSenha() {
        return senha;
    }
    public void setSenha(String senha) {
        this.senha = senha;
    }
}
