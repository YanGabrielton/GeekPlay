package geekplay;

import geekplay.dao.UsuarioDao;
import geekplay.model.Usuario;
import geekplay.util.HibernateUtil;
import io.javalin.Javalin;
import io.javalin.http.Context;
import java.util.Map;

public class App {
    public static void main(String[] args) {
        // Inicializa Hibernate com detecção automática
        HibernateUtil.getSessionFactory();
        
    
        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableDevLogging(); 
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(rule -> {
                    rule.allowHost("http://localhost:3000"); 
                    rule.allowHost("http://127.0.0.1:5500"); 
                });
            });
        }).start(7070); 
        
       
        app.get("/", ctx -> ctx.result("API GeekPlay operacional rodando"));
        
        UsuarioDao usuarioDao = new UsuarioDao();
        
        // Rotas CRUD
        app.post("/usuarios", ctx -> criarUsuario(ctx, usuarioDao));
        app.get("/usuarios", ctx -> listarUsuarios(ctx, usuarioDao));
        app.get("/usuarios/{id}", ctx -> buscarUsuarioPorId(ctx, usuarioDao));
        app.delete("usuarios/{id}", ctx -> deletarUsuario(ctx,usuarioDao));
        app.post("/login",ctx -> verificarLogin(ctx, usuarioDao));
        // Encerramento seguro
        app.events(event -> {
            event.serverStopped(HibernateUtil::shutdown);
        });


    }

    

    // Método para criar usuário
    private static void criarUsuario(Context ctx, UsuarioDao dao) {
        try {
            Usuario usuario = ctx.bodyAsClass(Usuario.class);
            dao.salvar(usuario);
            ctx.status(201).json(usuario); // 201 Created
        } catch (Exception e) {
            ctx.status(400).json(error("Dados inválidos: " + e.getMessage()));
        }
    }

  
private static void deletarUsuario(Context ctx, UsuarioDao dao) {
    try {
        int id = Integer.parseInt(ctx.pathParam("id"));
        dao.deletar(id);
        ctx.status(204); // 204 No Content (sucesso sem retorno)
    } catch (NumberFormatException e) {
        ctx.status(400).json("{\"error\": \"ID inválido\"}");
    } catch (Exception e) {
        ctx.status(500).json("{\"error\": \"Erro ao deletar usuário\"}");
    }
}

    

    // Método para listar usuários
    private static void listarUsuarios(Context ctx, UsuarioDao dao) {
        try {
            ctx.json(dao.listarTodos()); // 200 OK
        } catch (Exception e) {
            ctx.status(500).json(error("Erro interno ao listar usuários"));
        }
    }

    // Método para buscar por ID
    private static void buscarUsuarioPorId(Context ctx, UsuarioDao dao) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Usuario usuario = dao.buscarPorId(id);
            
            if(usuario != null) {
                ctx.json(usuario); // 200 OK
            } else {
                ctx.status(404).json(error("Usuário não encontrado")); // 404 Not Found
            }
        } catch (NumberFormatException e) {
            ctx.status(400).json(error("ID deve ser numérico")); // 400 Bad Request
        } catch (Exception e) {
            ctx.status(500).json(error("Erro na busca")); // 500 Internal Error
        }
    }


    private static void verificarLogin(Context ctx,UsuarioDao dao){
        try {
           Map<String, String> credenciais = ctx.bodyAsClass(Map.class);
           String email = credenciais.get("email");
           String senha = credenciais.get("senha");
           Usuario usuario = dao.verificarLogin(email, senha);
         
          if (usuario != null) {
            ctx.json(Map.of(
                "success", true,
                "usuario", Map.of(
                    "id", usuario.getId(),
                    "nome", usuario.getNome(),
                    "email", usuario.getEmail()
                   
                )
            ));
        } else {
            ctx.status(401).json(Map.of(
                "success", false,
                "message", "Credenciais inválidas ou conta inativa"
            ));
        }
    } catch (Exception e) {
        ctx.status(500).json(error("Erro ao processar login: " + e.getMessage()));
    }
    }

    // Método auxiliar para respostas de erro
    private static String error(String message) {
        return "{\"error\": \"" + message + "\"}";
    }
}