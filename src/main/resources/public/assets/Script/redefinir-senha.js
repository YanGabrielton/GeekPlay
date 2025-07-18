document.addEventListener('DOMContentLoaded', function() {
    // Configuração inicial
    const token = new URLSearchParams(window.location.search).get('token');
    document.getElementById('token').value = token;
    console.log('Token recebido:', token);

    // Elementos do DOM
    const form = document.getElementById('formRedefinirSenha');
    const novaSenhaInput = document.getElementById('novaSenha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const btnGerarSenha = document.getElementById('btnGerarSenha');
    const toggleSenha1 = document.getElementById('toggleSenha1');
    const toggleSenha2 = document.getElementById('toggleSenha2');
    const mensagemDiv = document.getElementById('mensagem');

    // Função para mostrar/ocultar senha
    const togglePasswordVisibility = (input, button) => {
        const icon = button.querySelector('i');
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.classList.toggle('fa-eye-slash');
        icon.classList.toggle('fa-eye');
    };

    // Event listeners para mostrar/ocultar senha
    toggleSenha1.addEventListener('click', () => togglePasswordVisibility(novaSenhaInput, toggleSenha1));
    toggleSenha2.addEventListener('click', () => togglePasswordVisibility(confirmarSenhaInput, toggleSenha2));

    // Gerar senha aleatória
    btnGerarSenha.addEventListener('click', async function() {
        try {
            const response = await fetch('/gerar-senha-aleatoria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Preenche ambos os campos
                novaSenhaInput.value = data.senha;
                confirmarSenhaInput.value = data.senha;
                
                // Mostra as senhas
                novaSenhaInput.type = 'text';
                confirmarSenhaInput.type = 'text';
                
                // Atualiza ícones
                toggleSenha1.querySelector('i').classList.replace('fa-eye', 'fa-eye-slash');
                toggleSenha2.querySelector('i').classList.replace('fa-eye', 'fa-eye-slash');
                
                // Mensagem de sucesso
                mensagemDiv.innerHTML = `
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <i class="fas fa-check-circle me-2"></i>
                        Senha gerada com sucesso! Revise e clique em "Salvar Nova Senha".
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                
                console.log('Senha gerada:', data.senha);
            }
        } catch (error) {
            console.error('Erro ao gerar senha:', error);
            mensagemDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Erro ao gerar senha automática
                </div>
            `;
        }
    });

    // Enviar formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const novaSenha = novaSenhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;
        
        // Validações
        if (novaSenha !== confirmarSenha) {
            mensagemDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    As senhas não coincidem!
                </div>
            `;
            return;
        }
        
        if (novaSenha.length < 6) {
            mensagemDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    A senha deve ter no mínimo 6 caracteres!
                </div>
            `;
            return;
        }
        
        try {
            const response = await fetch('/redefinir-senha?token=' + token, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    novaSenha: novaSenha,
                    confirmarSenha: confirmarSenha 
                })
            });
            
            const result = await response.json();
            console.log('Resposta do servidor:', result);
            
            if (result.success) {
                mensagemDiv.innerHTML = `
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle me-2"></i>
                        ${result.message} Redirecionando para login...
                    </div>
                `;
                
                setTimeout(() => {
                    window.location.href = '/pg-login';
                }, 2000);
            } else {
                mensagemDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        ${result.message}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            mensagemDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Erro de conexão com o servidor
                </div>
            `;
        }
    });
});