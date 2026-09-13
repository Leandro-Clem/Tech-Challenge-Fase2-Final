const { Sequelize, DataTypes } = require('sequelize');

// Inicializa o banco de dados SQLite, que será salvo automaticamente no arquivo 'database.sqlite'
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// Define o modelo da nossa tabela de Postagens
const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false // O título é obrigatório
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false // O conteúdo é obrigatório
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false // O autor é obrigatório
    }
});

// --- NOVO NA FASE 3 ---
// Comentários das postagens. O autor e o papel vêm do token JWT,
// nunca do corpo da requisição, para que ninguém comente em nome de outro.
const Comment = sequelize.define('Comment', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'aluno'
    }
});

// Relação 1:N — uma postagem tem vários comentários
Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// Exporta a conexão e os modelos para usarmos em outros arquivos
module.exports = { sequelize, Post, Comment };
