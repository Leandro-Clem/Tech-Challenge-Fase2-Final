const express = require('express');
const { sequelize, Post } = require('./database');
const { Op } = require('sequelize'); // Ferramenta do Sequelize para fazermos buscas (como o LIKE do SQL)

const app = express();
app.use(express.json());

// ==========================================
// ROTAS DA APLICAÇÃO (ENDPOINTS)
// ==========================================

// 1. POST /posts - Criação de Postagens
// Recebe título, conteúdo e autor e salva no banco
app.post('/posts', async (req, res) => {
    try {
        const { title, content, author } = req.body;
        // Cria a postagem no banco de dados
        const newPost = await Post.create({ title, content, author });
        res.status(201).json(newPost); // 201 significa "Criado com sucesso"
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar a postagem' });
    }
});

// 2. GET /posts/search - Busca de Posts
// OBS: Essa rota precisa vir ANTES do GET /posts/:id, senão o express confunde a palavra "search" com um ID.
app.get('/posts/search', async (req, res) => {
    const { q } = req.query; // Pega o termo de busca (ex: /posts/search?q=tecnologia)
    
    const posts = await Post.findAll({
        where: {
            [Op.or]: [
                { title: { [Op.like]: `%${q}%` } },
                { content: { [Op.like]: `%${q}%` } }
            ]
        }
    });
    res.json(posts);
});

// 3. GET /posts - Lista de todas as Postagens
app.get('/posts', async (req, res) => {
    const posts = await Post.findAll();
    res.json(posts);
});

// 4. GET /posts/:id - Leitura de um Post Específico
app.get('/posts/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id); // Busca pela Chave Primária (Primary Key)
    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ error: 'Post não encontrado' });
    }
});

// 5. PUT /posts/:id - Edição de Postagem
app.put('/posts/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    if (post) {
        const { title, content, author } = req.body;
        await post.update({ title, content, author }); // Atualiza os dados
        res.json(post);
    } else {
        res.status(404).json({ error: 'Post não encontrado' });
    }
});

// 6. DELETE /posts/:id - Exclusão de Postagem
app.delete('/posts/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    if (post) {
        await post.destroy(); // Apaga do banco
        res.json({ message: 'Post excluído com sucesso' });
    } else {
        res.status(404).json({ error: 'Post não encontrado' });
    }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = 3000;

// Só sobe o servidor se rodar o arquivo diretamente
if (require.main === module) {
    sequelize.sync().then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    });
}

// OBRIGATÓRIO: Exportar o app para o teste conseguir usar
module.exports = app;