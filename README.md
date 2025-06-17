
Baanco de Dados :
[filme.zip](https://github.com/user-attachments/files/20628064/filme.zip)
<h1 align="center"> - GeekPlay - </h1>

<p align="center">
  <img src="https://github.com/user-attachments/assets/6100bbe5-e415-449f-bb52-b3db5ecc2420" alt="sasukePixel" />
</p>
<div align="center">

[![Java](https://img.shields.io/badge/Java-ED8B00.svg?style=for-the-badge&logo=java&logoColor=white)](https://www.java.com/)
[![MySQL](https://img.shields.io/badge/MySQL-00758F.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3.svg?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Javalin](https://img.shields.io/badge/Javalin-077.svg?style=for-the-badge&color=009688)](https://javalin.io/)
[![Hibernate](https://img.shields.io/badge/Hibernate-59666C.svg?style=for-the-badge&logo=hibernate&logoColor=white)](https://hibernate.org/)
[![Made in Brazil](https://img.shields.io/badge/Made%20in-Brazil-009933.svg?style=for-the-badge)](https://github.com/YanGabrielton/GeekPlay)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow.svg?style=for-the-badge)](https://github.com/YanGabrielton/GeekPlay)

</div>

## 💡 Sobre o projeto

O **GeekPlay** é uma plataforma interativa voltada para fãs de filmes e cultura geek. Desenvolvida em Java com Javalin e Hibernate, ela oferece uma experiência dinâmica para consulta, cadastro e visualização de filmes e seus detalhes.

---

## 📦 Instalação

Siga o passo a passo para clonar e configurar o projeto na sua máquina:

### 1. Clone o repositório

```bash
git clone https://github.com/YanGabrielton/GeekPlay.git
```

### 2. Acesse o diretório do projeto

```bash
cd GeekPlay
```

---

## 🚀 Como iniciar o projeto

> **Importante:** Certifique-se de ter instalado o [Java](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html) e o [MySQL](https://www.mysql.com/) em sua máquina.  
> Se estiver usando **Visual Studio Code**, instale também a **extensão Java Extension Pack** (ou pelo menos a extensão `Java` da Microsoft).

### ⬇️ 3. Descubra o nome da sua máquina

Abra o terminal (CMD) e digite:

```bash
echo %computername%
```

> Copie o nome retornado – ele será usado na configuração do Hibernate.

---

### ⚙️ 4. Configure a classe `HibernateUtil.java`

1. Navegue até a pasta:

```
src > Util > HibernateUtil.java
```

2. No método `detectDatabaseType`, substitua pelo nome retornado no CMD:

```java
  String hostname = System.getenv().getOrDefault("L05023964", // Windows Digitar no CMD: ECHO "%COMPUTERNAME%"
                          System.getenv().getOrDefault("HOSTNAME",
```

---

### 🔁 5. Configure a URL de conexão do banco

Ainda em `HibernateUtil.java`, localize o trecho:

```java
String url = useMariaDB ? 
    "jdbc:mariadb://localhost:3306/filme" : 
    "jdbc:mysql://localhost:3307/filme"; 
```

- **Em casa:** use `3306`
- **No Senac:** use `3307`
- Altere de acordo com a porta configurada no seu banco

---

### 🛠️ 6. Atualize o arquivo `hibernate.cfg.xml`

1. Acesse:

```
src > resources-public > hibernate.cfg.xml
```

2. Altere as propriedades conforme seu ambiente:

```xml
<property name="hibernate.connection.url">jdbc:mysql://localhost:3307/filme</property>
<property name="hibernate.connection.username">root</property>
<property name="hibernate.connection.password"></property>
```

---

### ✅ 7. Execute o projeto

Abra o projeto no Visual Studio Code (ou outro IDE Java) e inicie o servidor Javalin a partir da sua classe principal. O projeto estará disponível localmente para testes.
App.java

---

## 🧠 Desenvolvedores

- [☕ Yan Gabrielton](https://github.com/YanGabrielton)
- [✍️ João Pedro silva do Prado](https://github.com/)
- [✍️ Matheus Aparecido Santos](https://github.com/)
- [✍️ Iago do Nascimento ](https://github.com/)
- [✍️ Andy Eduardo](https://github.com/Andyjr-code)



