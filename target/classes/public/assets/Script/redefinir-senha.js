// Extrai token da URL (ex: http://.../redefinir-senha?token=XYZ)
const urlParams = new URLSearchParams(window.location.search);
document.getElementById("token").value = urlParams.get('token');

async function redefinirSenha() {
    const token = document.getElementById("token").value;
    const novaSenha = document.getElementById("novaSenha").value;
    
    const response = await fetch("http://localhost:7070/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha })
    });
    
    const data = await response.json();
    document.getElementById("mensagem").textContent = data.message;
    
    if (data.success) {
        setTimeout(() => {
            window.location.href = "/login.html";
        }, 2000);
    }
}