package geekplay.dto;

public class AdicionarFavoritoDTO {
    private String idApi;
    private String tipoItem;
    private String titulo;

    // Construtor vazio necessário para desserialização
    public AdicionarFavoritoDTO() {
    }

    // Getters e Setters
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