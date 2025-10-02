# Forkando e clonando este repositório

1. Faça _login_ no [GitHub](https://github.com).
2. Acesse [https://github.com/faustocintra/vulcom-main-2025-2](https://github.com/faustocintra/vulcom-main-2025-2).
3. Clique sobre o botão `[Fork]` no canto superior direito.
4. Na página seguinte ("Create new fork"), não altere nada, simplesmente clique sobre o botão `[Create fork]`. Aguarde.
5. Confira se a URL mostrada no navegador corresponde a "https://github.com/**<SEU USUÁRIO>**/vulcom-main-2025-2".
6. Clique sobre o botão verde `[Code]` e copie o endereço do seu repositório forkado.
7. Abra o Visual Studio Code. Se houver algum projeto aberto, feche-o usando a opção de menu `Arquivo > Fechar Pasta` (ou `File > Close folder`).
8. Clique sobre o botão que se parece com um `Y` na barra vertical esquerda do Visual Studio Code. Em seguida, clique sobre o botão `[Clonar repositório...]` (ou `[Clone repository...]`). Nessa etapa, se o Git não estiver instalado na máquina, será necessário baixá-lo (a partir de [https://git-scm.com/](https://git-scm.com/)) e instalá-lo antes de poder clonar o repositório.
9. Na caixa de diálogo que se abre no alto da janela, cole o endereço do repositório copiado no passo 6.
10. Escolha um pasta local do computador para armazenar os arquivos do repositório clonado.
11. Ao ser perguntado se deseja abrir o repositório clonado, clique sobre o botão `[Abrir]`.

---

# Configurando o _back-end_

## Instalação das dependências

Abra um terminal no VS Code. Nele, execute os comandos:

```
cd back-end
npm install
```

Caso apareça uma mensagem alertando sobre vulnerabilidades detectadas, execute:

```
npm audit fix
```

## Criação do banco de dados

Ainda no terminal, execute:

```
npx prisma generate
npx prisma migrate dev --name create-tables
```

### Configuração das variáveis de ambiente

Renomeie o arquivo `.env.example` para `.env`. Ajuste o conteúdo do arquivo para o seguinte:

```ini
# Renomeie este arquivo para .env e preencha os valores abaixo

# Qualquer string aleatória
TOKEN_SECRET="[Qualquer string aleatória]"

# Nome do cookie de autenticação, p. ex. _auth
# # (mesmo valor de VITE_AUTH_COOKIE_NAME no .env.local do front-end)
AUTH_COOKIE_NAME="_auth"

# URLs do front-end a partir do qual serão aceitas requisições
ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

## Executando o projeto

Estando dentro da pasta `back-end`, execute:

```
npm run dev
```

---

# Configurando o _front-end_

## Instalação das dependências

Abra um segundo terminal no VS Code. Nele, execute os comandos:

```
cd front-end
npm install
```

Caso apareça uma mensagem alertando sobre vulnerabilidades detectadas, execute:

```
npm audit fix
```

### Configuração das variáveis de ambiente

Renomeie o arquivo `.env.local.example` para `.env.local`. Ajuste o conteúdo do arquivo para o seguinte:

```ini
# Renomeie este arquivo para .env.local e preencha os valores abaixo

# Preencha com a URL do back-end
VITE_API_BASE="http://localhost:8080"

# Preencha com o nome do cookie de autenticação
# (mesmo valor de AUTH_COOKIE_NAME no .env do back-end)
VITE_AUTH_TOKEN_NAME="_auth"
```

## Executando o projeto

Estando dentro da pasta `front-end`, execute:

```
npm run dev
```
