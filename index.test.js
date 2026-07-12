const request = require('supertest');
const app = require('./index');
const jwt = require('jsonwebtoken');
const { SECRET } = require('./authMiddleware'); 

describe('Testes da API de Blog', () => {
    
    test('Deve criar um novo post', async () => {
        // Gerando um token fixo para o ambiente de teste
        const token = jwt.sign({ username: 'teste', role: 'professor' }, SECRET);

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Teste Unitário',
                content: 'Conteúdo de teste'
                // O campo 'author' será preenchido automaticamente pelo seu middleware no index.js
            });

        // Log para debug caso falhe novamente
        if (response.statusCode !== 201) {
            console.log('Resposta do erro:', response.body);
        }

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Teste Unitário');
    });
});