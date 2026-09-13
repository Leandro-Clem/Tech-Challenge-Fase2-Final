const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sequelize, Post, Comment } = require('./database');
const { authorize, SECRET } = require('./authMiddleware');

const app = express();
app.use(express.json());

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { username, role } = req.body;
    if (role !== 'professor' && role !== 'aluno') {
        return res.status(400).json({ message: 'Role inválida!' });
    }
    const token = jwt.sign({ username, role }, SECRET, { expiresIn: '1h' });
    res.json({ message: `Login realizado como ${role}`, token: token });
});

// --- AUTORIA ---
// authorize('professor') garante apenas que quem chama é professor.
// Isto aqui garante que é o professor DONO da publicação: sem esta checagem,
// qualquer docente autenticado poderia editar ou apagar a aula de outro.
async function carregarPostDoAutor(req, res) {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
        res.status(404).json({ message: 'Post não encontrado' });
        return null;
    }

    if (post.author !== req.user.username) {
        res.status(403).json({
            message: 'Esta publicação é de outro professor. Apenas quem publicou pode alterá-la.'
        });
        return null;
    }

    return post;
}

// --- ROTAS DA API (CRUD) ---

// Listar todos
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar posts', error: error.message });
    }
});

// Busca por palavra-chave
// IMPORTANTE: precisa vir ANTES de '/posts/:id',
// senão o Express interpreta "search" como se fosse um id.
app.get('/posts/search', async (req, res) => {
    try {
        const termo = req.query.q || '';

        const posts = await Post.findAll({
            where: {
                [Op.or]: [
                    { title:   { [Op.like]: `%${termo}%` } },
                    { content: { [Op.like]: `%${termo}%` } }
                ]
            }
        });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar posts', error: error.message });
    }
});

// Buscar por ID
app.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        post ? res.status(200).json(post) : res.status(404).json({ message: 'Post não encontrado' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar post', error: error.message });
    }
});

// Criar
app.post('/posts', authorize('professor'), async (req, res) => {
    try {
        const post = await Post.create({ ...req.body, author: req.user.username });
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Editar — somente o autor da publicação
app.put('/posts/:id', authorize('professor'), async (req, res) => {
    try {
        const post = await carregarPostDoAutor(req, res);
        if (!post) return;

        // O autor é imutável: sai do token na criação e não muda mais.
        // Aceitá-lo no corpo permitiria transferir (ou roubar) a autoria.
        const { title, content } = req.body;

        await post.update({
            title: title ?? post.title,
            content: content ?? post.content
        });

        res.status(200).json({ message: 'Atualizado com sucesso' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Deletar — somente o autor da publicação
app.delete('/posts/:id', authorize('professor'), async (req, res) => {
    try {
        const post = await carregarPostDoAutor(req, res);
        if (!post) return;

        // Remove os comentários antes do post: o SQLite só aplica ON DELETE CASCADE
        // com PRAGMA foreign_keys ligado, então a limpeza é feita explicitamente.
        await Comment.destroy({ where: { postId: post.id } });
        await post.destroy();

        res.status(200).json({ message: `O post com id ${req.params.id} foi excluído com sucesso.` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar post', error: error.message });
    }
});

// --- COMENTÁRIOS (NOVO NA FASE 3) ---

// Listar os comentários de um post (público, como a leitura)
app.get('/posts/:id/comments', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post não encontrado' });

        const comments = await Comment.findAll({
            where: { postId: req.params.id },
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar comentários', error: error.message });
    }
});

// Comentar exige apenas estar autenticado: professor ou aluno.
// authorize() sem argumento valida o token sem exigir papel específico.
app.post('/posts/:id/comments', authorize(), async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post não encontrado' });

        const content = (req.body.content || '').trim();
        if (!content) return res.status(400).json({ message: 'O comentário não pode ficar vazio' });

        const comment = await Comment.create({
            content,
            author: req.user.username,
            role: req.user.role,
            postId: post.id
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao comentar', error: error.message });
    }
});

// Moderação: quem modera os comentários é o professor dono da publicação
app.delete('/comments/:id', authorize('professor'), async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comentário não encontrado' });

        const post = await Post.findByPk(comment.postId);
        if (post && post.author !== req.user.username) {
            return res.status(403).json({
                message: 'Só o professor que publicou a aula pode moderar os comentários dela.'
            });
        }

        await comment.destroy();
        res.status(200).json({ message: 'Comentário removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover comentário', error: error.message });
    }
});

// --- INICIALIZAÇÃO ---
if (require.main === module) {
    sequelize.sync().then(() => app.listen(3000, () => console.log('Servidor na porta 3000')));
}

module.exports = app;
