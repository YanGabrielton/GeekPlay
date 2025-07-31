package geekplay;

import geekplay.dao.FavoritoDao;
import geekplay.dao.UsuarioDao;
import geekplay.dto.AdicionarFavoritoDTO;
import geekplay.dto.AlterarSenhaDTO;
import geekplay.dto.EmailDTO;
import geekplay.dto.RedefinirSenhaDTO;
import geekplay.dto.VerificarLoginDTO;
import geekplay.model.Favorito;
import geekplay.model.Usuario;
import geekplay.util.EmailUtil;
import geekplay.util.HibernateUtil;
import geekplay.util.JwtUtil;
import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.staticfiles.Location;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;

public class App {

    public static void main(String[] args) {
        // Inicializa Hibernate com detecção automática
        HibernateUtil.getSessionFactory();

        Javalin app = Javalin.create(config -> {

            config.staticFiles.add(staticFileConfig -> {
                staticFileConfig.hostedPath = "/";
                staticFileConfig.directory = "public";
                staticFileConfig.precompress = false;
                staticFileConfig.location = Location.CLASSPATH; // obrigatório
            });
            config.bundledPlugins.enableDevLogging();
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(rule -> {
                    rule.allowHost("http://localhost:3000");
                    rule.allowHost("http://127.0.0.1:5501");
                });
            });

        }).start(7070);
        // Rotas de Navegação
        app.get("/pg-login", ctx -> ctx.redirect("/pages/Login.html"));
        app.get("/pg-recuperar-senha", ctx -> ctx.redirect("/pages/redefinir-senha.html"));
        app.get("/pg-index", ctx -> ctx.redirect("/index.html"));
        app.get("/pg-mangas", ctx -> ctx.redirect("/pages/Mangas.html"));
        app.get("/pg-animes", ctx -> ctx.redirect("/pages/Anime.html"));
        app.get("/pg-filmes", ctx -> ctx.redirect("/pages/Filmes.html"));
        app.get("/pg-sobre", ctx -> ctx.redirect("/pages/sobre.html"));
        app.get("/pg-perfil", ctx -> ctx.redirect("/pages/Perfil.html"));
        app.get("/pg-doacao", ctx -> ctx.redirect("/pages/Doacoes.html"));
        app.get("/pg-favoritos", ctx -> ctx.redirect("/pages/favoritos.html"));

        UsuarioDao usuarioDao = new UsuarioDao();
        FavoritoDao favoritoDao = new FavoritoDao();

        // Rotas CRUD
        app.post("/usuarios", ctx -> criarUsuario(ctx, usuarioDao));
        app.get("/usuarios", ctx -> listarUsuarios(ctx, usuarioDao));
        app.get("/usuarios/{id}", ctx -> buscarUsuarioPorId(ctx, usuarioDao));
        app.put("/usuarios/excluir", ctx -> excluirUsuario(ctx, new UsuarioDao()));

        app.post("/login", ctx -> verificarLogin(ctx, usuarioDao));
        app.post("/solicitar-recuperacao", ctx -> solicitarRecuperacaoSenha(ctx, usuarioDao));
        app.post("/redefinir-senha", ctx -> redefinirSenha(ctx, usuarioDao));

        app.get("/perfil", ctx -> obterPerfil(ctx, usuarioDao));
        app.post("/alterar-senha", ctx -> alterarSenha(ctx, usuarioDao));
        // app.put("/usuarios/excluir", ctx -> excluirUsuario(ctx, new UsuarioDao()));

        app.post("/gerar-senha-aleatoria", ctx -> {
            String senha = gerarSenhaAleatoria();
            ctx.json(Map.of("success", true, "senha", senha));
        });
        app.post("/favoritos", ctx -> adicionarFavorito(ctx, favoritoDao));
        app.get("/favoritos", ctx -> listarFavoritos(ctx, favoritoDao));
        app.delete("/favoritos/{idApi}", ctx -> removerFavorito(ctx, favoritoDao));
        app.get("/favoritos/verificar/{idApi}", ctx -> verificarFavorito(ctx, favoritoDao));
        // Encerramento seguro
        app.events(event -> {
            event.serverStopped(HibernateUtil::shutdown);
        });

        app.before(ctx -> {
            // Lista de rotas que não requerem autenticação
            List<String> rotasPublicas = List.of("/", "/login", "/usuarios", "/solicitar-recuperacao",
                    "/redefinir-senha", "/pg-login");

            // Libera arquivos estáticos como .css, .js, .png, etc
            if (ctx.path().startsWith("/assets") || ctx.path().endsWith(".css") || ctx.path().endsWith(".js")
                    || ctx.path().endsWith(".png") || ctx.path().endsWith(".jpg") || ctx.path().endsWith(".html")) {
                return;
            }
            if (rotasPublicas.contains(ctx.path())) {
                return; // Não aplica autenticação
            }

            // Para rotas de favoritos, deixe o próprio método tratar a autenticação
            if (ctx.path().startsWith("/favoritos")) {
                return;
            }

            // Verificação padrão para outras rotas
            String authHeader = ctx.header("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer")) {
                ctx.status(401).json(Map.of("success", false, "message", "Token não fornecido"));
                return;
            }

            String token = authHeader.substring(7);
            if (!JwtUtil.validateToken(token)) {
                ctx.status(401).json(Map.of("success", false, "message", "Token inválido ou expirado"));
            }
        });

    }
private static void excluirUsuario(Context ctx, UsuarioDao dao) {
    try {
        String token = ctx.header("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            ctx.status(401).json(Map.of("success", false, "message", "Token não fornecido"));
            return;
        }

        String email = JwtUtil.getEmailFromToken(token.substring(7));
        Usuario usuario = dao.buscarPorEmail(email);

        if (usuario == null) {
            ctx.status(404).json(Map.of("success", false, "message", "Usuário não encontrado"));
            return;
        }

        usuario.setStatus('I');
        dao.atualizar(usuario);

        ctx.json(Map.of("success", true, "message", "Conta desativada com sucesso"));
    } catch (Exception e) {
        e.printStackTrace();
        ctx.status(500).json(Map.of("success", false, "message", "Erro ao desativar conta: " + e.getMessage()));
    }
}


    private static void criarUsuario(Context ctx, UsuarioDao dao) {
        try {
            Usuario usuario = ctx.bodyAsClass(Usuario.class);

            UsuarioDao usuarioDao = new UsuarioDao();
            String token = JwtUtil.generateToken(usuario.getEmail());
            // Verifica se o email já está cadastrado
            if (usuarioDao.emailExiste(usuario.getEmail())) {
                ctx.status(400).json(Map.of(
                        "success", false,

                        "message", "E-mail já cadastrado."));
                return;
            }

            // Verifica se o nome de usuário já existe
            if (usuarioDao.nomeExiste(usuario.getNome())) {
                ctx.status(400).json(Map.of(
                        "success", false,
                        "message", "Nome de usuário já está em uso."));
                return;
            }

            // Verifica se a senha é válida
            if (usuario.getSenha().length() < 6) {
                ctx.status(400).json(Map.of(
                        "success", false,
                        "message", "A senha deve ter pelo menos 6 caracteres."));
                return;
            }

            // Salva no banco
            dao.salvar(usuario);

            // Retorna sucesso e nome
            ctx.status(201).json(Map.of(
                    "success", true,
                    "token", token,
                    "usuario", Map.of("nome", usuario.getNome())));

        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).json(Map.of(
                    "success", false,
                    "message", "Erro ao registrar: " + e.getMessage()));
        }
    }

    private static void listarUsuarios(Context ctx, UsuarioDao dao) {
        try {
            ctx.json(dao.listarTodos());
        } catch (Exception e) {
            ctx.status(500).json(error("Erro interno ao listar usuários"));
        }
    }

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
        // Recebe o DTO com email e senha
        VerificarLoginDTO dto = ctx.bodyAsClass(VerificarLoginDTO.class);
        String email = dto.getEmail();
        String senha = dto.getSenha();

        Usuario usuario = dao.verificarLogin(email, senha);

        if (usuario == null) {
            ctx.status(401).json(Map.of(
                "success", false,
                "message", "Credenciais inválidas ou conta inexistente"
            ));
            return;
        }

        // ✅ Se conta estiver inativa, reativa
        if (usuario.getStatus() != null && usuario.getStatus() == 'I') {
            usuario.setStatus('A');
            dao.atualizar(usuario);
        }

        // ✅ Gera token após a verificação e reativação (se necessário)
        String token = JwtUtil.generateToken(usuario.getEmail());

     ctx.status(200).json(Map.of(
    "success", true,
    "message", "Login realizado com sucesso",
    "token", token,
    "usuario", Map.of(
        "id", usuario.getId(),
        "nome", usuario.getNome(),
        "email", usuario.getEmail()
    )
));


    } catch (Exception e) {
        e.printStackTrace();
        ctx.status(500).json(Map.of(
            "success", false,
            "message", "Erro ao processar login: " + e.getMessage()
        ));
    }
}

    public static void voidTestarMudarSenha(Context ctx, UsuarioDao dao) {
        ctx.redirect("/pages/redefinir-senha.html");

    };

    private static void solicitarRecuperacaoSenha(Context ctx, UsuarioDao dao) {
        try {
            // Map<String, String> body = ctx.bodyAsClass(Map.class);
            // String email = body.get("email"); // troquei esse map para utilizar DTO mais
            // organizado e menos erros
            EmailDTO dto = ctx.bodyAsClass(EmailDTO.class);
            String email = dto.getEmail();

            Usuario usuario = dao.buscarPorEmail(email);
            if (usuario == null) {
                ctx.status(404).json(Map.of(
                        "success", false,
                        "message", "Email não cadastrado"));
                return;
            }

            // Gera token com validade de 1 hora
            String token = JwtUtil.generateTokenRecovery(usuario.getEmail(), 3600000);
            System.out.println("Token gerado: " + token);

            String linkConfirmacao = "http://localhost:7070/pages/redefinir-senha.html?token=" + token;
            EmailUtil.enviarEmail(email, "Confirme a Solicitação de Recuperação de Senha",
                    "Olá, " + usuario.getNome() + ",\n\n" +
                            "Você solicitou a recuperação de sua senha. Clique no link abaixo para confirmar:\n\n" +
                            linkConfirmacao + "\n\n" +
                            "Se você não solicitou isso, ignore este e-mail.");

            ctx.json(Map.of(
                    "success", true,
                    "token", token,
                    "email", email,
                    "nome", usuario.getNome(),
                    "message", "Instruções enviadas para seu email"));

        } catch (Exception e) {
            e.printStackTrace(); // Isso ajuda a descobrir o erro exato no console
            ctx.status(500).json(Map.of(

                    "success", false,
                    "message", "Erro ao solicitar recuperação"));
        }
    }

    // Método redefinirSenha atualizado
    private static void redefinirSenha(Context ctx, UsuarioDao dao) {
        try {
            String token = ctx.queryParam("token");
            System.out.println("[INFO] Token Encontrado: " + token);
            if (token == null || token.isEmpty()) {
                ctx.status(401).json(Map.of("success", false, "message", "Token não fornecido"));
                return;
            }

            String email = JwtUtil.getEmailFromToken(token);
            System.out.println("[REDEFINIR SENHA] Usuário: " + email + " | Token: " + token);

            if (!JwtUtil.validateToken(token)) {
                ctx.status(401).json(Map.of("success", false, "message", "Token inválido ou expirado"));
                return;
            }

            RedefinirSenhaDTO dto = ctx.bodyAsClass(RedefinirSenhaDTO.class);
            String novaSenha = dto.getNovaSenha();
            String confirmarSenha = dto.getConfirmarSenha();

            if (novaSenha == null || novaSenha.isEmpty() || confirmarSenha == null || confirmarSenha.isEmpty()) {
                ctx.status(400).json(Map.of("success", false, "message", "Preencha ambos os campos de senha"));
                return;
            }

            if (!novaSenha.equals(confirmarSenha)) {
                ctx.status(400).json(Map.of("success", false, "message", "As senhas não coincidem"));
                return;
            }

            if (novaSenha.length() < 6) {
                ctx.status(400).json(Map.of("success", false, "message", "A senha deve ter no mínimo 6 caracteres"));
                return;
            }

            Usuario usuario = dao.buscarPorEmail(email);
            if (usuario == null) {
                ctx.status(404).json(Map.of("success", false, "message", "Usuário não encontrado"));
                return;
            }

            dao.atualizarSenha(email, novaSenha);
            System.out.println("[SENHA ALTERADA] Para: " + email + " | Nova senha: " + novaSenha);

            ctx.json(Map.of("success", true, "message", "Senha redefinida com sucesso"));

        } catch (Exception e) {
            System.err.println("[ERRO CRÍTICO] " + e.getMessage());
            e.printStackTrace();
            ctx.status(500).json(Map.of("success", false, "message", "Erro interno ao redefinir senha"));
        }
    }

    private static String gerarSenhaAleatoria() {
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%&*()[=]+-!*/";
        StringBuilder senha = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            int index = (int) (Math.random() * caracteres.length());
            senha.append(caracteres.charAt(index));
        }
        return senha.toString();
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
            AlterarSenhaDTO dto = ctx.bodyAsClass(AlterarSenhaDTO.class);
            String senhaAtual = dto.getSenhaAtual();
            String novaSenha = dto.getNovaSenha();

            String token = ctx.header("Authorization").substring(7);
            String email = JwtUtil.getEmailFromToken(token);
            System.out.println("Senha Alterada com Sucesso: " + novaSenha);
            if (senhaAtual == null || novaSenha == null) {
                ctx.status(400).json(Map.of(
                        "success", false,
                        "message", "Dados incompletos"));
                return;
            }

            Usuario usuario = dao.buscarPorEmail(email);
            if (usuario == null || !usuario.getSenha().equals(senhaAtual)) {
                ctx.status(401).json(Map.of(
                        "success", false,
                        "message", "Senha atual incorreta"));
                return;
            }

            dao.atualizarSenha(email, novaSenha);

            ctx.json(Map.of(
                    "success", true,
                    "message", "Senha atualizada com sucesso"));

        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                    "success", false,
                    "message", "Erro ao alterar senha: " + e.getMessage()));
        }
    }

    private static void adicionarFavorito(Context ctx, FavoritoDao dao) {
        try {
            String token = ctx.header("Authorization");
            if (token == null) {
                ctx.status(401).json(Map.of("success", false, "message", "Token não fornecido"));
                return;
            }

            // Opcional: Remove "Bearer " apenas se existir
            if (token.startsWith("Bearer ")) {
                token = token.substring(7).trim();
            }

            String email = JwtUtil.getEmailFromToken(token);

            AdicionarFavoritoDTO dto = ctx.bodyAsClass(AdicionarFavoritoDTO.class);
            String idApi = dto.getIdApi();
            String tipoItem = dto.getTipoItem();
            String titulo = dto.getTitulo();

            if (idApi == null || tipoItem == null || titulo == null) {
                ctx.status(400).json(Map.of("success", false, "message", "Dados incompletos"));
                return;
            }

            UsuarioDao usuarioDao = new UsuarioDao();
            Usuario usuario = usuarioDao.buscarPorEmail(email);

            if (usuario == null) {
                ctx.status(404).json(Map.of("success", false, "message", "Usuário não encontrado"));
                return;
            }

            if (dao.isFavorito(usuario.getId(), idApi, tipoItem)) {
                ctx.status(400).json(Map.of("success", false, "message", "Item já está nos favoritos"));
                return;
            }

            Favorito favorito = new Favorito(usuario, idApi, tipoItem, titulo);
            dao.favoritar(favorito);

            ctx.status(201).json(Map.of(
                    "success", true,
                    "message", "Item adicionado aos favoritos"));
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                    "success", false,
                    "message", "Erro ao adicionar favorito: " + e.getMessage()));
        }
    }

    private static void listarFavoritos(Context ctx, FavoritoDao dao) {
        try {
            // 1. Verificação simplificada do token
            String authHeader = ctx.header("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ctx.status(401).json(Map.of("success", false, "message", "Token não fornecido"));
                return;
            }

            // 2. Extrai e valida o token
            String token = authHeader.substring(7).trim();
            if (!JwtUtil.validateToken(token)) {
                ctx.status(401).json(Map.of("success", false, "message", "Token inválido ou expirado"));
                return;
            }

            // 3. Obtém o email do usuário
            String email = JwtUtil.getEmailFromToken(token);

            // 4. Busca o usuário
            Usuario usuario = new UsuarioDao().buscarPorEmail(email);
            if (usuario == null) {
                ctx.status(404).json(Map.of("success", false, "message", "Usuário não encontrado"));
                return;
            }

            // 5. Lista favoritos (com ou sem filtro por tipo)
            String tipoItem = ctx.queryParam("tipo_item");
            List<Favorito> favoritos = tipoItem != null
                    ? dao.listarPorUsuarioETipo(usuario.getId(), tipoItem)
                    : dao.listarPorUsuario(usuario.getId());

            // 6. Formata resposta
            List<Map<String, String>> response = favoritos.stream()
                    .map(f -> Map.of(
                            "id_api", f.getIdApi(),
                            "tipo_item", f.getTipoItem(),
                            "titulo", f.getTitulo()))
                    .collect(Collectors.toList());

            ctx.json(Map.of("success", true, "favoritos", response));

        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                    "success", false,
                    "message", "Erro ao listar favoritos: " + e.getMessage()));
        }
    }

    private static void removerFavorito(Context ctx, FavoritoDao dao) {
        try {
            String token = ctx.header("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                ctx.status(401).json(Map.of("success", false, "message", "Token não fornecido"));
                return;
            }

            token = token.substring(7).trim();
            String email = JwtUtil.getEmailFromToken(token);
            String idApi = ctx.pathParam("idApi");
            String tipoItem = ctx.queryParam("tipo_item");

            if (tipoItem == null || tipoItem.isEmpty()) {
                ctx.status(400).json(Map.of("success", false, "message", "Parâmetro tipo_item é obrigatório"));
                return;
            }

            UsuarioDao usuarioDao = new UsuarioDao();
            Usuario usuario = usuarioDao.buscarPorEmail(email);

            if (usuario == null) {
                ctx.status(404).json(Map.of("success", false, "message", "Usuário não encontrado"));
                return;
            }

            boolean removido = dao.removerFavorito(usuario.getId(), idApi, tipoItem);

            if (removido) {
                ctx.status(200).json(Map.of( // ✅ Corrigido aqui
                        "success", true,
                        "message", "Item removido dos favoritos"));
            } else {
                ctx.status(404).json(Map.of(
                        "success", false,
                        "message", "Favorito não encontrado"));
            }
        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                    "success", false,
                    "message", "Erro ao remover favorito: " + e.getMessage()));
        }
    }

    private static void verificarFavorito(Context ctx, FavoritoDao dao) {
        try {
            // 1. Verifica o header de autorização
            String authHeader = ctx.header("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ctx.status(401).json(Map.of("success", false, "message", "Token não fornecido"));
                return;
            }

            // 2. Extrai o token
            String token = authHeader.substring(7);

            // 3. Valida o token
            if (!JwtUtil.validateToken(token)) {
                ctx.status(401).json(Map.of("success", false, "message", "Token inválido ou expirado"));
                return;
            }

            // 4. Obtém o email do usuário
            String email = JwtUtil.getEmailFromToken(token);

            // 5. Obtém parâmetros da requisição
            String idApi = ctx.pathParam("idApi");
            String tipoItem = ctx.queryParam("tipo_item");

            if (tipoItem == null || tipoItem.isEmpty()) {
                ctx.status(400).json(Map.of("success", false, "message", "Parâmetro tipo_item é obrigatório"));
                return;
            }

            // 6. Busca o usuário no banco
            Usuario usuario = new UsuarioDao().buscarPorEmail(email);
            if (usuario == null) {
                ctx.status(404).json(Map.of("success", false, "message", "Usuário não encontrado"));
                return;
            }

            // 7. Verifica se é favorito
            boolean isFavorito = dao.isFavorito(usuario.getId(), idApi, tipoItem);

            ctx.json(Map.of(
                    "success", true,
                    "isFavorito", isFavorito));

        } catch (Exception e) {
            ctx.status(500).json(Map.of(
                    "success", false,
                    "message", "Erro ao verificar favorito: " + e.getMessage()));
        }
    }

    // Método auxiliar para respostas de erro
    private static String error(String message) {
        return "{\"error\": \"" + message + "\"}";
    }

}