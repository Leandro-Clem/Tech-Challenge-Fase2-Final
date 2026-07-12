# Tech Challenge — Fase 02 | Blog API

API REST de blogging para professores da rede pública de educação, desenvolvida como entrega da Fase 2 da Pós-Graduação em **Full Stack Development (FIAP / POSTECH)**.

**Aluno:** Leandro Clemente

---

## 📌 O Problema

A maioria dos professores da rede pública não possui uma plataforma centralizada para publicar aulas e conteúdos didáticos. Na fase anterior, o problema foi endereçado com uma aplicação em **OutSystems** (low-code). Com a necessidade de escalar a solução para um panorama nacional, o back-end foi **refatorado para uma arquitetura própria**, em Node.js, com persistência em banco de dados e infraestrutura containerizada.

---

## 🛠 Tecnologias

| Camada | Tecnologia |
| :--- | :--- |
| Runtime | Node.js 18 |
| Framework HTTP | Express 5 |
| ORM | Sequelize |
| Banco de dados | SQLite |
| Autenticação | JWT (jsonwebtoken) |
| Testes | Jest + Supertest |
| Containerização | Docker |
| CI/CD | GitHub Actions |

---

## 🏗 Arquitetura

A aplicação segue uma arquitetura em camadas, com separação clara de responsabilidades:

```
┌──────────────────────────────────────────────┐
│  CLIENTE (Postman / Insomnia / Front-end)    │
└───────────────────┬──────────────────────────┘
                    │ HTTP + JSON
                    │ Header: Authorization: Bearer <token>
┌───────────────────▼──────────────────────────┐
│  CAMADA HTTP  —  index.js (Express 5)        │
│  • express.json()  (parser de body)          │
│  • Rotas: /login, /posts, /posts/:id ...     │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│  CAMADA DE SEGURANÇA — authMiddleware.js     │
│  • authorize(role)  → valida JWT             │
│  • Verifica a role (RBAC)                    │
│  • Injeta req.user no request                │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│  CAMADA DE DADOS — database.js (Sequelize)   │
│  • Model Post (title, content, author)       │
└───────────────────┬──────────────────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│  BANCO DE DADOS — SQLite (database.sqlite)   │
└──────────────────────────────────────────────┘
```

### Estrutura de Pastas

```
Tech-Challenge-Fase2/
├── .github/
│   └── workflows/
│       └── node.js.yml      # Pipeline de CI (GitHub Actions)
├── index.js                 # Servidor Express + definição das rotas
├── database.js              # Conexão Sequelize + Model Post
├── authMiddleware.js        # Middleware de autenticação/autorização JWT
├── index.test.js            # Suíte de testes (Jest + Supertest)
├── Dockerfile               # Imagem da aplicação
├── package.json
└── README.md
```

### Modelo de Dados

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER (PK) | Automático | Identificador único, autoincremento |
| `title` | STRING | Sim | Título da postagem |
| `content` | TEXT | Sim | Corpo da aula/postagem |
| `author` | STRING | Sim | Preenchido pelo servidor via JWT (não aceito do cliente) |
| `createdAt` | DATETIME | Automático | Data de criação |
| `updatedAt` | DATETIME | Automático | Data da última alteração |

### Decisões Arquiteturais

- **Por que SQL e não NoSQL?** O domínio é totalmente estruturado — todo post tem exatamente os mesmos campos, sem necessidade de schema flexível.
- **Por que SQLite?** É embutido e zero-config, reduzindo drasticamente o atrito de setup e a execução no pipeline de CI. Como toda a persistência passa pelo Sequelize, migrar para PostgreSQL exige apenas alterar o `dialect` — o código de domínio permanece intacto.
- **Por que JWT?** É *stateless*, não exige armazenamento de sessão no servidor — essencial para escalar horizontalmente, já que qualquer instância pode validar o token de forma independente.

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- npm
- Docker (opcional)

### Execução Local

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd Tech-Challenge-Fase2

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor
npm start
# → Servidor disponível em http://localhost:3000
```

O banco SQLite é criado automaticamente no primeiro start, via `sequelize.sync()`. Não é necessário rodar migrations manualmente.

### Execução com Docker

```bash
docker build -t blog-api .
docker run -p 3000:3000 blog-api
```

### Testes

```bash
npm test                # roda a suíte
npm run test:coverage   # roda com relatório de cobertura
```

---

## 📡 Endpoints

**Base URL:** `http://localhost:3000`

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Gera o token JWT de acesso | Público |
| `GET` | `/posts` | Lista todas as postagens | Público |
| `GET` | `/posts/search?q=termo` | Busca por palavra-chave (título ou conteúdo) | Público |
| `GET` | `/posts/:id` | Retorna uma postagem específica | Público |
| `POST` | `/posts` | Cria uma nova postagem | 🔒 Professor |
| `PUT` | `/posts/:id` | Edita uma postagem existente | 🔒 Professor |
| `DELETE` | `/posts/:id` | Exclui uma postagem | 🔒 Professor |

> **Autenticação:** nas rotas protegidas, envie o header `Authorization: Bearer <seu-token>`

### `POST /login`

```json
// Requisição
{
  "username": "leandro",
  "role": "professor"
}

// Resposta 200 OK
{
  "message": "Login realizado como professor",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Roles aceitas: `professor` e `aluno`. Qualquer outro valor retorna **400**.

### `POST /posts` 🔒

```json
// Requisição (Header: Authorization: Bearer <token>)
{
  "title": "Introdução à Fotossíntese",
  "content": "Nesta aula veremos como as plantas convertem luz em energia."
}

// Resposta 201 Created
{
  "id": 1,
  "title": "Introdução à Fotossíntese",
  "content": "Nesta aula veremos como as plantas convertem luz em energia.",
  "author": "leandro",
  "createdAt": "2026-07-12T14:02:11.000Z",
  "updatedAt": "2026-07-12T14:02:11.000Z"
}
```

⚠️ O campo `author` **não é lido do corpo da requisição** — ele é sobrescrito pelo servidor com o `username` extraído do token, impedindo que um cliente forje a autoria de uma postagem.

### `GET /posts/search`

```
GET /posts/search?q=fotossíntese
→ 200 OK  (lista de posts cujo título OU conteúdo contém o termo)
```

### Códigos de Status

| Código | Quando ocorre |
| :--- | :--- |
| `200` | Leitura, edição ou exclusão bem-sucedida |
| `201` | Post criado com sucesso |
| `400` | Campos obrigatórios ausentes ou role inválida no login |
| `401` | Header `Authorization` não enviado |
| `403` | Token inválido/expirado, ou role sem permissão |
| `404` | O `id` informado não corresponde a nenhum post |
| `500` | Falha inesperada na camada de persistência |

---

## 🔐 Segurança

- **Autenticação stateless via JWT**, com expiração de 1 hora.
- **RBAC** (controle de acesso por papéis) através do middleware `authorize(role)`, que intercepta a requisição antes que ela chegue ao handler. Alunos leem; professores produzem.
- **Integridade da autoria:** o campo `author` é injetado pelo servidor a partir do token, nunca aceito do cliente.
- **Proteção contra SQL Injection:** todas as queries passam pelo Sequelize, que parametriza os valores automaticamente.
- **Validação de schema no model** (`allowNull: false`).
- **Distinção semântica 401 × 403:** `401` = "você não se identificou"; `403` = "você se identificou, mas não tem permissão".
- A chave de assinatura do JWT é lida de `process.env.JWT_SECRET`, com fallback apenas para execução local.

---

## ✅ Testes

A suíte usa **Jest** como runner e **Supertest** para exercitar as rotas HTTP sem subir um servidor real na porta — o Supertest consome o `app` exportado pelo `index.js` diretamente.

Ciclo de vida da suíte:
- `beforeAll` → `sequelize.sync({ force: true })`, recriando as tabelas do zero. Garante que cada execução parta de um estado limpo e determinístico.
- `afterAll` → `sequelize.close()`, liberando o handle da conexão. Sem isso, o Jest não encerra o processo e o pipeline de CI roda até o timeout.

Cenários cobertos:
- ✅ Login e geração de token
- ✅ Rejeição de role inválida (400)
- ✅ Criação de post (201) e validação da autoria via token
- ✅ Bloqueio de aluno em rota de escrita (403)
- ✅ Bloqueio de requisição sem token (401)
- ✅ Listagem de posts
- ✅ Busca por palavra-chave
- ✅ Post inexistente (404)
- ✅ Edição e exclusão

```bash
npm run test:coverage
```

Requisito mínimo do desafio: **20% de cobertura** — atendido.

---

## 🐳 Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

Os manifestos (`package*.json`) são copiados **antes** do código-fonte de propósito: o Docker invalida o cache a partir da primeira camada alterada. Como o `package.json` muda pouco e o código muda a cada commit, essa ordem faz com que o `npm install` seja reaproveitado do cache na maioria dos builds.

---

## ⚙️ CI/CD — GitHub Actions

O workflow dispara a cada `push`: provisiona um runner Ubuntu, instala o Node 18, resolve as dependências e executa a suíte de testes. Se algum teste falhar, o job fica vermelho e a quebra é visível direto no commit — impedindo que uma regressão passe despercebida.

---

## 🧗 Desafios Enfrentados

**1. Conflito de rotas: `/posts/search` capturado por `/posts/:id`**
O Express avalia as rotas na ordem em que são registradas. Com a rota paramétrica declarada primeiro, a requisição para `/posts/search` era interpretada como um post de `id = "search"`, retornando 404. **Solução:** registrar a rota estática acima da paramétrica.

**2. O Jest não encerrava após os testes**
A suíte passava, mas o processo ficava pendurado (`A worker process has failed to exit gracefully`). A conexão do Sequelize mantinha um handle aberto. **Solução:** `sequelize.close()` no `afterAll`.

**3. Testes contaminados entre execuções**
Como o SQLite persiste em arquivo, posts criados em uma rodada sobreviviam para a próxima, tornando as asserções não-determinísticas. **Solução:** `sync({ force: true })` no `beforeAll`.

**4. Separar o `app` do `listen` para viabilizar o Supertest**
Chamar `app.listen()` no topo do `index.js` fazia os testes tentarem subir um servidor real na porta 3000, gerando conflito. **Solução:** condicionar o `listen` a `require.main === module` e exportar apenas o `app`.

**5. Impedir a falsificação de autoria**
Na primeira versão, o `author` vinha no corpo da requisição — bastava um professor autenticado enviar `author: "outro_professor"` para atribuir a postagem a um colega. **Solução:** sobrescrever explicitamente `author: req.user.username` após o spread do body.

**6. Distinguir 401 de 403**
Inicialmente, ausência de token e falta de permissão retornavam o mesmo código, dificultando o diagnóstico. **Solução:** separar a semântica.

### Aprendizados

A migração do OutSystems (low-code) para Node.js expôs decisões que antes ficavam escondidas pela plataforma: ciclo de vida de conexão, ordem de rotas, tratamento explícito de status HTTP. O ORM acelera muito o desenvolvimento, mas é preciso entender o que ele faz por baixo. Ter um pipeline de CI desde o início muda o comportamento — erros que passariam despercebidos localmente ficam evidentes no push. E o Docker eliminou por completo a classe de problemas do tipo "na minha máquina funciona".

---

## 🔭 Melhorias Futuras

- [ ] Migrar para PostgreSQL em produção (alterando apenas o `dialect`)
- [ ] Adicionar paginação em `GET /posts`
- [ ] Documentar a API com Swagger/OpenAPI
- [ ] Adicionar `docker-compose.yml` orquestrando API + banco
- [ ] Estender o CI para construir e publicar a imagem Docker (etapa de CD)

---

## 📦 Entregáveis

- **Código-fonte:** este repositório, incluindo `Dockerfile` e workflow de CI/CD
- **Documentação:** este README + documento técnico detalhado
- **Apresentação gravada:** vídeo demonstrando o funcionamento da aplicação