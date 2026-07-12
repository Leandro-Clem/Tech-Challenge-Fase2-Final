const request = require('supertest');
const app = require('./index'); // Isso já traz o seu servidor pronto
const { sequelize } = require('./database');

describe('Testes da API de Blog', () => {
    // Antes de todos os testes, limpamos o banco
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    test('Deve criar um novo post', async () => {
        const response = await request(app)
            .post('/posts')
            .send({
                title: 'Teste Unitário',
                content: 'Conteúdo de teste',
                author: 'Leandro'
            });
        
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Teste Unitário');
    });
});