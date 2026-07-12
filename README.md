# Tech-Challenge-Fase2-Final
Repositorio para o desafio

# 1. Verifica o status para ver os arquivos travados
git status

# 2. Força a remoção de qualquer trava de índice do git (isso resolve 90% dos casos de erro de permissão)
del .git\index.lock

# 3. Adiciona todos os arquivos que criamos
git add .

# 4. Faz o commit (se ele reclamar de novo, tente colocar uma mensagem curta)
git commit -m "Commit de finalizacao do projeto"

# 5. Finalmente, o push forçado
git push origin main
