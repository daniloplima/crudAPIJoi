const http = require('http')
const Database = require('./database')
const Joi = require('joi');
/*
O HAPI JS trabalha seguindo a especificação restfull
dependendo da chamada, dependendo do código http ele retorna um status diferente e identifica quem será chamado
de acordo com método



CREATE - POST - /products -> dados no body da requisição
READ - GET - /products -> listar informações
READ - GET - /products/:id -> obter um recurso pelo id
READ - GET - /products/:id/colors -> obtem todas as cores de um produto especifico
UPDATE
1-forma => PUT -atualizar o objeto completo
PUT - /products/:id -> dados completos no body da requisição
2-forma => PATCH - atualizar o objeto parcial
PATCH - /products/:id -> dados parciais (só nome, só cpf ou opcionais)

DELETE - DELETE - /products/:id -> remove um produto especifico 

*/

/*
http.createServer((req, res) => {
    res.end('hello world')
})

    .listen(3000, () => {
        console.log('servidor rodando')
    })
*/

//para trabalhar com aplicações profissionais, instalaremos o hapi.js na versão 16
//npm install --save hapi@16
//importamos o hapijs
const Hapi = require('hapi')
const server = new Hapi.Server()
server.connection({ port: 3000 });

//para validar a requisição sem precisar fazer vários ifs instalamos o Joi
//npm i --save joi
; (async () => {
    server.route([
        //criamos a rota de listar herois
        {
            //definir a url
            path: '/heroes',
            method: 'GET',
            handler: async (request, reply) => {
                try {
                    const dados = await Database.listar()
                    return reply(dados)
                }
                catch (error) {
                    console.error('Deu ruim**', error)
                    return reply()
                }
            }
        },
        {
            path: '/heroes',
            method: 'POST',
            handler: async (request, reply) => {
                try {
                    const { payload } = request
                    const item = {
                        ...payload,
                        id: Date.now()
                    }
                    const result = Database.cadastrar(item)
                    return reply('cadastrado com sucesso!')
                }
                catch (error) {
                    console.error('deu ruim', error)
                    return reply('deu ruim')
                }
            },
            config: {
                validate: {
                    //podemos validar todos os tipos de requisições
                    //->payload -> body da requisição
                    //->params -> url da requisição products/:id
                    //-> query -> url products?nome=Danilo&idade=20
                    //-> headers -> geralmente usado para validar token
                    payload: {
                        nome: Joi.string().max(10).min(2).required(),
                        poder: Joi.string().max(5).min(3).required(),
                        dataNascimento: Joi.date().required(),
                        namorada: Joi.string()
                    }
                }
            }
        },
        {
            path: '/heroes/{id}',
            method: 'DELETE',
            config: {
                validate: {
                    params: {
                        id: Joi.number().required()
                    }
                }
            },
            handler: async (request, reply) => {
                const { id } = request.params;
                const result = await Database.remove(id)
                return reply('Removido com sucesso!')
            }
        }
    ])

    //1 startar a api
    await server.start()
    console.log('server running at 3000')
})()