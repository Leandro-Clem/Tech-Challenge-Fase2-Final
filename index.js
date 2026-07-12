const express = require('express');
const jwt = require('jsonwebtoken');
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
    const posts = await Post.findAll();
    res.json(posts);
});

// Buscar por ID
app.get('/posts/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    post ? res.json(post) : res.status(404).json({ message: 'Post não encontrado' });
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
        updated ? res.json({ message: 'Atualizado com sucesso' }) : res.status(404).json({ message: 'Não encontrado' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Deletar
app.delete('/posts/:id', authorize('professor'), async (req, res) => {
    try {
        const deleted = await Post.destroy({ where: { id: req.params.id } });
        
        if (deleted) {
            // Agora devolvemos status 200 e uma mensagem amigável
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