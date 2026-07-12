const request = require('supertest');
const app = require('./index');
const jwt = require('jsonwebtoken');
const { SECRET } = require('./authMiddleware');
const { sequelize } = require('./database'); // Importe a instância do sequelize

describe('Testes da API de Blog', () => {
    
    // Garante que o banco seja sincronizado antes dos testes começarem
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Cria as tabelas do zero
    });

    test('Deve criar um novo post', async () => {
        const token = jwt.sign({ username: 'leandro', role: 'professor' }, SECRET);

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Teste Unitário',
                content: 'Conteúdo de teste'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Teste Unitário');
    });

    // Fecha a conexão após os testes para o Jest não travar
    afterAll(async () => {
        await sequelize.close();
    });
});