import prisma from '../database/client.js'
import { parseCarPayload } from '../validators/carSchema.js'
import { ZodError } from 'zod'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {

    // Preenche qual usuário criou o carro com o id do usuário autenticado
    req.body.created_user_id = req.authUser.id

    // Preenche qual usuário modificou por último o carro com o id
    // do usuário autenticado
    req.body.updated_user_id = req.authUser.id

    // Validação com Zod (converte/normaliza tipos antes)
    try {
      const valid = parseCarPayload(req.body)
      await prisma.car.create({ data: valid })
    }
    catch(err) {
      if(err instanceof ZodError) {
        const errors = {}
        for(const e of err.errors) {
          const path = e.path[0] ?? '_form'
          errors[path] = e.message
        }
        return res.status(400).json({ errors })
      }
      throw err
    }

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveAll = async function(req, res) {
  try {

    const includedRels = req.query.include?.split(',') ?? []
    
    const result = await prisma.car.findMany({
      orderBy: [
        { brand: 'asc' },
        { model: 'asc' },
        { id: 'asc' }
      ],
      include: {
        customer: includedRels.includes('customer'),
        created_user: includedRels.includes('created_user'),
        updated_user: includedRels.includes('updated_user')
      }
    })

    // HTTP 200: OK (implícito)
    res.send(result)
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.retrieveOne = async function(req, res) {
  try {

    const includedRels = req.query.include?.split(',') ?? []

    const result = await prisma.car.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: includedRels.includes('customer'),
        created_user: includedRels.includes('created_user'),
        updated_user: includedRels.includes('updated_user')
      }
    })

    // Encontrou ~> retorna HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou ~> retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.update = async function(req, res) {
  try {

    // Validação com Zod antes de atualizar
    try {
      const valid = parseCarPayload(req.body)
      var result = await prisma.car.update({
        where: { id: Number(req.params.id) },
        data: valid
      })
    }
    catch(err) {
      if(err instanceof ZodError) {
        const errors = {}
        for(const e of err.errors) {
          const path = e.path[0] ?? '_form'
          errors[path] = e.message
        }
        return res.status(400).json({ errors })
      }
      throw err
    }

    // Encontrou e atualizou ~> HTTP 204: No Content
    if(result) res.status(204).end()
    // Não encontrou (e não atualizou) ~> HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)

    // HTTP 500: Internal Server Error
    res.status(500).end()
  }
}

controller.delete = async function(req, res) {
  try {
    await prisma.car.delete({
      where: { id: Number(req.params.id) }
    })

    // Encontrou e excluiu ~> HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    if(error?.code === 'P2025') {
      // Não encontrou e não excluiu ~> HTTP 404: Not Found
      res.status(404).end()
    }
    else {
      // Outros tipos de erro
      console.error(error)

      // HTTP 500: Internal Server Error
      res.status(500).end()
    }
  }
}

export default controller