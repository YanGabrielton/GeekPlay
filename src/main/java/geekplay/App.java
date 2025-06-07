package geekplay;

import geekplay.dao.UsuarioDao;
import geekplay.model.Usuario;
import geekplay.util.HibernateUtil;
import geekplay.util.JwtUtil;
import io.javalin.Javalin;
import io.javalin.http.Context;
import java.util.Map;
import java.util.List;

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
        app.delete("usuarios/{id}", ctx -> deletarUsuario(ctx, usuarioDao));
        app.post("/login", ctx -> verificarLogin(ctx, usuarioDao));
        app.post("/solicitar-recuperacao", ctx -> solicitarRecuperacaoSenha(ctx, usuarioDao));
        app.post("/redefinir-senha", ctx -> redefinirSenha(ctx, usuarioDao));
        app.get("/perfil", ctx -> obterPerfil(ctx, usuarioDao));
        app.post("/alterar-senha", ctx -> alterarSenha(ctx, usuarioDao));
        // Encerramento seguro
        app.events(event -> {
            event.serverStopped(HibernateUtil::shutdown);
        });

        app.before(ctx -> {
            // Lista de rotas que não requerem autenticação
            List<String> rotasPublicas = List.of("/login", "/usuarios", "/public");

            if (rotasPublicas.contains(ctx.path())) {
                return; // Não aplica autenticação
            }

            // Obtém o token do cabeçalho Authorization
            String authHeader = ctx.header("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ctx.status(401).json(Map.of("error", "Token não fornecido"));

                return;
            }

            // Extrai o token (remove "Bearer ")
            String token = authHeader.substring(7);

            if (!JwtUtil.validateToken(token)) {
                ctx.status(401).json(Map.of("error", "Token inválido ou expirado"));
                return;
            }
        });

    }

    private static void criarUsuario(Context ctx, UsuarioDao dao) {
        try {
            Usuario usuario = ctx.bodyAsClass(Usuario.class);
            dao.salvar(usuario);
            // Retorna apenas o nome do usuário, igual ao login
            ctx.status(201).json(Map.of(
                    "success", true,
                    "usuario", Map.of("nome", usuario.getNome()) // o que vai retornar no login
            ));
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(400).json(Map.of(
                    "success", false,
                    "message", "Erro ao registrar: " + e.getMessage()));
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

            if (usuario != null) {
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

    private static void verificarLogin(Context ctx, UsuarioDao dao) {
        try {
            Map<String, String> credenciais = ctx.bodyAsClass(Map.class);
            String email = credenciais.get("email");
            String senha = credenciais.get("senha");
            Usuario usuario = dao.verificarLogin(email, senha);

            if (usuario != null) {
                String token = JwtUtil.generateToken(usuario.getEmail());
                ctx.json(Map.of(
                        "success", true,
                        "message", "Login realizado com sucesso",
                        "token", token, // Supondo que o token já esteja gerado no usuário
                        "usuario", Map.of(
                                "id", usuario.getId(),
                                "nome", usuario.getNome(),
                                "email", usuario.getEmail()

                        )));
            } else {
                ctx.status(401).json(Map.of(
                        "success", false,
                        "message", "Credenciais inválidas ou conta inativa"));
            }
        } catch (Exception e) {
            ctx.status(500).json(error("Erro ao processar login: " + e.getMessage()));
        }

    }

    private static void solicitarRecuperacaoSenha(Context ctx, UsuarioDao dao) {
        try {
            Map<String, String> body = ctx.bodyAsClass(Map.class);
            String email = body.get("email");

            Usuario usuario = dao.buscarPorEmail(email);
            if (usuario == null) {
                ctx.status(404).json(Map.of(
                        "success", false,
                        "message", "Email não cadastrado"));
                return;
            }

            // Gera token com validade de 1 hora
            String token = JwtUtil.generateTokenRecovery(usuario.getEmail(), 3600000);

            // Em produção: enviar email com o token
            ctx.json(Map.of(
                    "success", true,
                    "message", "Instruções enviadas para seu email"));

        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                    "success", false,
                    "message", "Erro ao solicitar recuperação"));
        }
    }

    private static void redefinirSenha(Context ctx, UsuarioDao dao) {
        try {
            Map<String, String> body = ctx.bodyAsClass(Map.class);
            String token = body.get("token");
            String novaSenha = body.get("novaSenha");

            if (!JwtUtil.validateToken(token)) {
                ctx.status(401).json(Map.of(
                        "success", false,
                        "message", "Token inválido ou expirado"));
                return;
            }

            String email = JwtUtil.getEmailFromToken(token);
            Usuario usuario = dao.buscarPorEmail(email);
            usuario.setSenha(novaSenha); // Em produção: criptografar!
            dao.salvar(usuario);

            ctx.json(Map.of(
                    "success", true,
                    "message", "Senha redefinida com sucesso"));

        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                    "success", false,
                    "message", "Erro ao redefinir senha"));
        }
    }

    private static void obterPerfil(Context ctx, UsuarioDao dao) {
        try {
            String token = ctx.header("Authorization").substring(7);
            String email = JwtUtil.getEmailFromToken(token);

            Usuario usuario = dao.buscarPorEmail(email);

            // Padrão idêntico ao verificarLogin
            ctx.json(Map.of(
                    "success", true,
                    "usuario", Map.of(
                            "nome", usuario.getNome(),
                            "email", usuario.getEmail())));
        } catch (Exception e) {
            // Mesmo tratamento de erro das outras rotas
            ctx.status(401).json(Map.of(
                    "success", false,
                    "message", "Erro ao obter perfil: " + e.getMessage()));
        }
    }

    private static void alterarSenha(Context ctx, UsuarioDao dao) {
    try {
        Map<String, String> body = ctx.bodyAsClass(Map.class);
        String token = ctx.header("Authorization").substring(7);
        String email = JwtUtil.getEmailFromToken(token);
        
        // Validações
        if (!body.containsKey("senhaAtual") || !body.containsKey("novaSenha")) {
            ctx.status(400).json(Map.of(
                "success", false,
                "message", "Dados incompletos"
            ));
            return;
        }
        
        // Verifica senha atual
        Usuario usuario = dao.buscarPorEmail(email);
        if (usuario == null || !usuario.getSenha().equals(body.get("senhaAtual"))) {
            ctx.status(401).json(Map.of(
                "success", false,
                "message", "Senha atual incorreta"
            ));
            return;
        }
        
        // Atualiza usando o novo método do DAO
        dao.atualizarSenha(email, body.get("novaSenha"));
        
        ctx.json(Map.of(
            "success", true,
            "message", "Senha atualizada com sucesso"
        ));
        
    } catch (Exception e) {
        ctx.status(500).json(Map.of(
            "success", false,
            "message", "Erro ao alterar senha: " + e.getMessage()
        ));
    }
}
    // Método auxiliar para respostas de erro
    private static String error(String message) {
        return "{\"error\": \"" + message + "\"}";
    }

}