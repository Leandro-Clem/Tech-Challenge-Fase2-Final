const jwt = require('jsonwebtoken');
const { SECRET } = require('./authMiddleware'); // Importe o segredo

describe('Testes da API de Blog', () => {
    
    test('Deve criar um novo post', async () => {
        // Gera um token válido em tempo real para o teste
        const token = jwt.sign({ username: 'professor_teste', role: 'professor' }, SECRET);

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`) 
            .send({
                title: 'Teste Unitário',
                content: 'Conteúdo de teste'
            });

        expect(response.statusCode).toBe(201); // Agora deve passar!
        expect(response.body.title).toBe('Teste Unitário');
    });
});