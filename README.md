# Tech Challenge - Blog API (FIAP)

Projeto desenvolvido como parte da Pós-Graduação Full Stack da FIAP. Esta é uma API RESTful completa construída com Node.js e Express, utilizando SQLite como banco de dados.

## Tecnologias utilizadas
- Node.js
- Express
- Sequelize (ORM para SQLite)
- Jest (Testes unitários)
- Docker
- JWT (Autenticação e Autorização)

## Como rodar o projeto
1. Clone este repositório: `git clone <url-do-seu-repo>`
2. Instale as dependências: `npm install`
3. Inicie o servidor: `npm start`
4. Execute os testes: `npm test`

## Funcionalidades
- **Autenticação Segura:** Sistema de login via JWT (JSON Web Token).
- **Controle de Acesso (RBAC):** Professores (acesso total) e Alunos (somente leitura).
- **CRUD completo de postagens:** (Create, Read, Update, Delete).
- **Preenchimento Inteligente:** Autor da postagem vinculado automaticamente via Token.
- **Busca de postagens:** Por ID e listagem geral.
- **Testes automatizados:** Com cobertura de 20%.
- **Containerização:** Projeto pronto para rodar com Docker.

## Rotas da API

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Gera token de acesso | Público |
| `GET` | `/posts` | Lista todas as postagens | Público |
| `GET` | `/posts/:id` | Busca postagem específica | Público |
| `POST` | `/posts` | Cria nova postagem | Professor |
| `PUT` | `/posts/:id` | Edita postagem existente | Professor |
| `DELETE` | `/posts/:id` | Exclui postagem | Professor |

> **Autenticação:** Para rotas de Professor, utilize o Header: `Authorization: Bearer <seu-token-aqui>`

## Evidências de Teste

<img width="1258" height="939" alt="image" src="https://github.com/user-attachments/assets/8a0c23f7-13b0-41eb-8456-4427b8e03c13" />
-------------------------------------------------------------------------------------------------------------------------------------
<img width="1245" height="640" alt="image" src="https://github.com/user-attachments/assets/f2f90c48-0bc8-4862-ab85-dbb68e3f393f" />


