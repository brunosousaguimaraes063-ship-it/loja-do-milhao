# Loja do Milhão — versão inicial

Este projeto contém a página inicial da Loja do Milhão, destinada exclusivamente a preparar cobranças Pix.

## O que já está pronto
- Página adaptada para celular.
- Campo de valor, preenchido inicialmente com R$ 100,00.
- Descrição inicial "Não informada".
- Aviso claro de que ainda não são criadas cobranças reais.

## O que ainda falta
A integração com a API Pagar.me/Stone não está incluída nesta versão. Para criar cobranças reais, será necessário:
1. Confirmar que a conta está habilitada para Pix e para o uso da API.
2. Criar um backend seguro para chamar a API.
3. Guardar a chave secreta somente nas variáveis de ambiente do servidor — nunca neste HTML nem em repositório público.
4. Configurar e validar o webhook de atualização de status.
5. Testar em ambiente apropriado antes de usar em produção.

## Publicação simples
Este é um site estático e pode ser publicado em uma hospedagem que aceite HTML estático, como a Vercel. Envie o arquivo `index.html` para um repositório GitHub e importe o repositório na Vercel. Não adicione chaves ou senhas ao repositório.

## Arquivos
- `index.html`: página inicial.
- `README.md`: estas instruções.
