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

// Exporta a conexão e o modelo para usarmos em outros arquivos
module.exports = { sequelize, Post };