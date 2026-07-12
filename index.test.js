const request = require('supertest');
const app = require('./index'); // Importa seu app

describe('Testes da API de Blog', () => {
    
    test('Deve criar um novo post', async () => {
        // 1. Primeiro, precisamos de um token válido
        // Você pode simular o login ou usar um token JWT gerado com a mesma SECRET
        const token = "SEU_TOKEN_AQUI_PARA_TESTE"; 

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`) // <--- ISSO É O QUE FALTA!
            .send({
                title: 'Teste Unitário',
                content: 'Conteúdo de teste'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Teste Unitário');
    });
});