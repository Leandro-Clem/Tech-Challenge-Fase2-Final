const request = require('supertest'); // <--- ESSA LINHA ESTÁ FALTANDO
const app = require('./index');
const jwt = require('jsonwebtoken');
const { SECRET } = require('./authMiddleware');

describe('Testes da API de Blog', () => {
    
    test('Deve criar um novo post', async () => {
        // Gera um token válido para o teste
        const token = jwt.sign({ username: 'professor_teste', role: 'professor' }, SECRET);

        const response = await request(app) // Agora o Jest reconhece o 'request'
            .post('/posts')
            .set('Authorization', `Bearer ${token}`) 
            .send({
                title: 'Teste Unitário',
                content: 'Conteúdo de teste'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Teste Unitário');
    });
});