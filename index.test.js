const request = require('supertest');
const app = require('./index');
const jwt = require('jsonwebtoken');
const { SECRET } = require('./authMiddleware');
const { sequelize } = require('./database');

describe('Testes da API de Blog', () => {

    let tokenProfessor;
    let tokenAluno;
    let postId;

    // Garante que o banco seja sincronizado antes dos testes começarem
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Cria as tabelas do zero

        tokenProfessor = jwt.sign({ username: 'leandro', role: 'professor' }, SECRET);
        tokenAluno = jwt.sign({ username: 'maria', role: 'aluno' }, SECRET);
    });

    // --- AUTENTICAÇÃO ---

    test('Deve gerar token no login de professor', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'leandro', role: 'professor' });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    test('Deve rejeitar login com role inválida', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'hacker', role: 'diretor' });

        expect(response.statusCode).toBe(400);
    });

    // --- CRIAÇÃO ---

    test('Deve criar um novo post', async () => {
        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${tokenProfessor}`)
            .send({
                title: 'Teste Unitário',
                content: 'Conteúdo de teste sobre fotossíntese'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Teste Unitário');
        // O autor deve vir do token, e não do corpo da requisição
        expect(response.body.author).toBe('leandro');

        postId = response.body.id;
    });

    test('Deve bloquear aluno tentando criar post (403)', async () => {
        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${tokenAluno}`)
            .send({ title: 'Proibido', content: 'Aluno não pode criar' });

        expect(response.statusCode).toBe(403);
    });

    test('Deve bloquear requisição sem token (401)', async () => {
        const response = await request(app)
            .post('/posts')
            .send({ title: 'Sem token', content: 'Nao autenticado' });

        expect(response.statusCode).toBe(401);
    });

    // --- LEITURA ---

    test('Deve listar todos os posts', async () => {
        const response = await request(app).get('/posts');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('Deve retornar 404 para post inexistente', async () => {
        const response = await request(app).get('/posts/9999');

        expect(response.statusCode).toBe(404);
    });

    // --- BUSCA ---

    test('Deve buscar posts por palavra-chave', async () => {
        const response = await request(app).get('/posts/search?q=fotossintese');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    // --- EDIÇÃO ---

    test('Deve editar um post existente', async () => {
        const response = await request(app)
            .put(`/posts/${postId}`)
            .set('Authorization', `Bearer ${tokenProfessor}`)
            .send({ title: 'Título Atualizado', content: 'Conteúdo revisado' });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Atualizado com sucesso');
    });

    // --- EXCLUSÃO ---

    test('Deve excluir um post existente', async () => {
        const response = await request(app)
            .delete(`/posts/${postId}`)
            .set('Authorization', `Bearer ${tokenProfessor}`);

        expect(response.statusCode).toBe(200);
    });

    // Fecha a conexão após os testes para o Jest não travar
    afterAll(async () => {
        await sequelize.close();
    });
});