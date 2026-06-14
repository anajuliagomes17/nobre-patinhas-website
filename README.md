# Nobre Patinhas - Guia de Instalação e Execução

## 1. Pré-requisitos

Antes de iniciar, a máquina deve possuir acesso à internet e apenas o Visual Studio Code instalado.

Será necessário instalar:

* Git
* Node.js
* XAMPP
* Visual Studio Code (caso ainda não esteja instalado)

---

# 2. Instalar o Git

1. Acesse:

https://git-scm.com/downloads

2. Baixe a versão para Windows.

3. Execute o instalador.

4. Clique em "Next" em todas as etapas.

5. Finalize a instalação.

6. Abra o Prompt de Comando e execute:

```bash
git --version
```

Deve aparecer algo semelhante a:

```bash
git version 2.xx.x
```

---

# 3. Instalar o Node.js

1. Acesse:

https://nodejs.org

2. Baixe a versão LTS.

3. Execute o instalador.

4. Clique em "Next" até finalizar.

5. Reinicie o computador.

6. Verifique a instalação:

```bash
node -v
```

Exemplo:

```bash
v22.0.0
```

7. Verifique o npm:

```bash
npm -v
```

---

# 4. Instalar o XAMPP

1. Acesse:

https://www.apachefriends.org

2. Baixe a versão mais recente.

3. Execute o instalador.

4. Instale:

* Apache
* MySQL
* phpMyAdmin

5. Finalize a instalação.

---

# 5. Iniciar o XAMPP

Abra o XAMPP Control Panel.

Inicie:

* Apache
* MySQL

Os dois serviços devem ficar verdes.

---

# 6. Importar a API

Copie a pasta da API para:

```text
C:\xampp\htdocs\
```

Exemplo:

```text
C:\xampp\htdocs\nobre-patinhas-api
```

A estrutura deverá conter arquivos semelhantes a:

```text
atualizar_estoque.php
atualizar_usuario.php
cadastrar_agendamento.php
cadastrar_pet.php
cadastrar_produto.php
cadastrar_usuario.php
cancelar_agendamento.php
criar_pedido.php
db.php
editar_pet.php
editar_produto.php
enviar_mensagem.php
excluir_produto.php
gerenciar_thread.php
listar_agendamentos_admin.php
listar_agendamentos_usuario.php
listar_itens_pedido.php
listar_mensagens.php
listar_pedidos_admin.php
listar_pedidos_usuario.php
listar_pedidos.php
listar_pets_usuario.php
listar_usuarios.php
login.php
produtos.php
remover_pet.php
```

---

# 7. Importar o Banco de Dados

1. Abra:

```text
http://localhost/phpmyadmin
```

2. Clique em:

```text
Novo
```

3. Crie um banco chamado:

```text
nobre_patinhas_api
```

4. Selecione o banco criado.

5. Clique em:

```text
Importar
```

6. Selecione o arquivo:

```text
nobre_patinhas_api.sql
```

7. Clique em:

```text
Executar
```

8. Aguarde a importação.

---

# 8. Testar a API

Abra o navegador:

```text
http://localhost/nobre-patinhas-api/produtos.php
```

Deve aparecer um JSON semelhante a:

```json
[
  {
    "id":1,
    "name":"..."
  }
]
```

Se aparecer o JSON, a API está funcionando.

---

# 9. Importar o Front-End

Copie a pasta do site para qualquer local.

Exemplo:

```text
C:\Projetos\Nobre-Patinhas-Website
```

Abra essa pasta no VS Code.

---

# 10. Instalar as dependências

Abra o terminal do VS Code.

Execute:

```bash
npm install
```

Aguarde o término.

O comando instalará todas as dependências listadas no package.json.

---

# 11. Verificar o favicon

Confirme a existência do arquivo:

```text
public/favicon.png
```

---

# 12. Executar o Front-End

No terminal:

```bash
npm run dev
```

Será exibido algo semelhante a:

```text
Local: http://localhost:5173/

ou

Local: http://localhost:8080/
```

---

# 13. Abrir o sistema

Abra:

```text
http://localhost:

ou

http://localhost:8080/
```

---

# 14. Verificar comunicação Front-End x API

Acesse:

```text
Produtos
```

Se os produtos forem carregados corretamente, a integração está funcionando.

---

# 15. Testar funcionalidades principais

Realizar os seguintes testes:

### Cadastro de usuário

Criar uma nova conta.

### Login

Entrar com usuário cadastrado.

### Pets

Cadastrar um pet.

Verificar se aparece em:

```text
Minha Conta → Meus Pets
```

### Agendamentos

Criar um agendamento.

Verificar se aparece:

```text
Minha Conta → Agendamentos
```

### Pedidos

Realizar uma compra.

Verificar se aparece:

```text
Minha Conta → Pedidos
```

### Administração

Entrar com conta administrativa.

Verificar:

* Dashboard
* Produtos
* Estoque
* Pedidos
* Agendamentos

---

# 16. Contas de teste

Administrador:

```text
admin@nobre.com
senha: admin
```

Repositor:

```text
repositor@nobre.com
senha: rep
```

Funcionário:

```text
funcionario@nobre.com
senha: func
```

---

