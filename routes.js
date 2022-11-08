import { Router, json } from 'express'
import cors from 'cors'

import { treinosDadosGerais, treinosDelete, treinosIndex, treinosPesq, treinosPorTipo, treinosStore, treinosTotalVotos, treinosUpdate, treinosVotos } from './controllers/TreinoController.js';
import { adminIndex, adminStore } from './controllers/AdminController.js'
import { loginAdmin } from './controllers/LoginController.js'
import { votoIndex, votoStore, votoConfirme, votoTotais, votoTotais2 } from './controllers/VotoController.js'




import upload from './middlewares/FotoStore.js'
 import { verificaLogin } from './middlewares/VerificaLogin.js';

const router = Router()
router.use(cors())

router.use(json())



router.get('/treinos', treinosIndex)
      .post('/treinos',upload.single('foto'), treinosStore)
      .put('/treinos/:id', treinosUpdate)
      .delete('/treinos/:id', treinosDelete)
      .get('/treinos/pesq/:tempo', treinosPesq)
      .get('/treinos/gerais', treinosDadosGerais)
      .get('/treinos/totalVotos', treinosTotalVotos)
      .get('/treinos/tipo', treinosPorTipo)
      .get('/treinos/votos', treinosVotos)

      
router.get('/admins', adminIndex)
            .post('/admins', adminStore)

            
router.get('/login', loginAdmin)

router.get('/votos', votoIndex)
      .post('/votos', votoStore)
      .get('/votos/confirma/:hash', votoConfirme)
      .get('/votos/totais', votoTotais2)


export default router