const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sequelize, Post } = require('./database');
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

// Editar
app.put('/posts/:id', authorize('professor'), async (req, res) => {
    try {
        const [updated] = await Post.update(req.body, { where: { id: req.params.id } });
        updated
            ? res.status(200).json({ message: 'Atualizado com sucesso' })
            : res.status(404).json({ message: 'Não encontrado' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Deletar
app.delete('/posts/:id', authorize('professor'), async (req, res) => {
    try {
        const deleted = await Post.destroy({ where: { id: req.params.id } });

        if (deleted) {
            res.status(200).json({ message: `O post com id ${req.params.id} foi excluído com sucesso.` });
        } else {
            res.status(404).json({ message: 'Post não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar post', error: error.message });
    }
});

// --- INICIALIZAÇÃO ---
if (require.main === module) {
    sequelize.sync().then(() => app.listen(3000, () => console.log('Servidor na porta 3000')));
}

module.exports = app;