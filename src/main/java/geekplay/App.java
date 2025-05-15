package geekplay;

import geekplay.dao.UsuarioDao;
import geekplay.model.Usuario;
import geekplay.util.HibernateUtil;
import io.javalin.Javalin;
import io.javalin.http.Context;

public class App {
    public static void main(String[] args) {
        // Inicializa Hibernate
        HibernateUtil.getSessionFactory();
        //configuração seguindo a documentação do Javalin
        
        Javalin app = Javalin.create(config -> {
            // Configurações do Javalin
             config.bundledPlugins.enableDevLogging();
          

        }).start(7070); //a porta 7000 deu ocupada
        app.get("/", ctx -> ctx.result("Servidor GeekPlay funcionando "));
       
        
        UsuarioDao usuarioDao = new UsuarioDao();
        
        // Rotas CRUD
        app.post("/usuarios", ctx -> criarUsuario(ctx, usuarioDao));
        app.get("/usuarios", ctx -> listarUsuarios(ctx, usuarioDao));
        app.get("/usuarios/{id}", ctx -> buscarUsuarioPorId(ctx, usuarioDao));
        
        // Fecha Hibernate ao encerrar
        app.events(event -> {
            event.serverStopped(HibernateUtil::shutdown);
        });
    }
    
    private static void criarUsuario(Context ctx, UsuarioDao usuarioDao) {
        try {
            Usuario usuario = ctx.bodyAsClass(Usuario.class);
            usuarioDao.salvar(usuario);
            ctx.status(201).json(usuario);
        } catch (Exception e) {
            ctx.status(400).result("Erro ao criar usuário: " + e.getMessage());
        }
    }
    
    private static void listarUsuarios(Context ctx, UsuarioDao usuarioDao) {
        try {
            ctx.json(usuarioDao.listarTodos());
        } catch (Exception e) {
            ctx.status(500).result("Erro ao listar usuários");
        }
    }
    
    private static void buscarUsuarioPorId(Context ctx, UsuarioDao usuarioDao) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Usuario usuario = usuarioDao.buscarPorId(id);
            if (usuario != null) {
                ctx.json(usuario);
            } else {
                ctx.status(404).result("Usuário não encontrado");
            }
        } catch (NumberFormatException e) {
            ctx.status(400).result("ID inválido");
        } catch (Exception e) {
            ctx.status(500).result("Erro ao buscar usuário");
        }
    }
}