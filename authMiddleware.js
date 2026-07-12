const jwt = require('jsonwebtoken');

// Em produção, a chave deve vir de variável de ambiente.
// O fallback existe apenas para facilitar a execução local e o CI.
const SECRET = process.env.JWT_SECRET || 'Chave_TechChallenge';

function authorize(requiredRole) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({ message: 'Token de autenticação não fornecido' });
        }

        // Divide o 'Bearer token' para pegar apenas o código
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token de autenticação mal formatado' });
        }

        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token inválido ou expirado' });
            }

            // Verifica a role: se a rota exige uma role específica, o usuário
            // deve ter essa role OU ser um professor (que tem acesso total)
            if (requiredRole && decoded.role !== requiredRole && decoded.role !== 'professor') {
                return res.status(403).json({ message: 'Você não tem permissão para esta ação' });
            }

            req.user = decoded;
            next();
        });
    };
}

module.exports = { authorize, SECRET };