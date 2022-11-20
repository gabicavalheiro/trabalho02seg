import dbKnex from '../dados/db_config.js'
import ejs from 'ejs'
import puppeteer from 'puppeteer'

export const treinosIndex = async (req, res) => {
  try {
    // obtém da tabela de treinos todos os registros
    const treinos = await dbKnex.select("*").from("treinos")
    res.status(200).json(treinos)
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const treinosStore = async (req, res) => {

  console.log(req.file.originalname);
  console.log(req.file.filename);
  console.log(req.file.mimetype);
  console.log(req.file.size);

  const foto = req.file.path; // obtém o caminho do arquivo no server

  // atribui via desestruturação
  const { nome, professor, usuario_id, tempo, tipo } = req.body

  // se não informou estes atributos
  if (!nome || !professor  || !usuario_id || !tempo || !tipo || !foto) {
    res.status(400).json({ id: 0, msg: "Erro... informe nome, professor, usuario_id, tipo, foto e tempo em minutos do treino" })
    return
  }

  try {
    const novo = await dbKnex('treinos').insert({ nome, professor, usuario_id, tempo, tipo, foto })

    // novo[0] => retorna o id do registro inserido                     
    res.status(201).json({ id: novo[0], msg: "Ok! Inserido com sucesso" })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const treinosUpdate = async (req, res) => {
  //  const id = req.params.id;
  const { id } = req.params;

  // atribui via desestruturação
  const { nome, professor, usuario_id, tempo, tipo } = req.body

  if (!nome || !professor || !usuario_id || !tempo || !tipo) {
    res.status(400).json(
      {
        id: 0,
        msg: "Erro... informe nome, professor, usuario_id, tipo  e tempo em minutos do treino"
      })
    return
  }

  try {
    await dbKnex("treinos").where({ id })
      .update({ nome, professor, usuario_id })

    res.status(200).json({ id, msg: "Ok! Alterado com sucesso" })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }

}

export const treinosDelete = async (req, res) => {
  //  const id = req.params.id;
  const { id } = req.params;

  console.log(req.usuario_id)
  // console.log(req.admin_nome)

  try {
    await dbKnex("treinos").where({ id }).del()
    res.status(200).json({ id, msg: "Ok! Excluído com sucesso" })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const treinosPesq = async (req, res) => {

  const { tempo } = req.params

  try {
    const treinos = await dbKnex("treinos").where('tempo', '>=', tempo)
    res.status(200).json(treinos)
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}


export const treinosDadosGerais = async (req, res) => {
  try {
    const consulta = await dbKnex("treinos")
            .min({menor: "tempo"})
            .max({maior: "tempo"})
            .avg({media: "tempo"})
            .count({num: "*"})
    const {menor, maior, media, num} = consulta[0]        
    res.status(200).json({menor, maior, media: Number(media).toFixed(1) + " min", num })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const treinosTotalVotos = async (req, res) => {
  try {
    const consulta = await dbKnex("treinos")
            .sum({total: "votos"})
            .max({maior: "votos"})
    const {total, maior} = consulta[0]        
    res.status(200).json({total, maior})
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const treinosPorTipo = async (req, res) => {
  try {
    const consulta = await dbKnex("treinos").select("tipo")
            .count({num: "*"}).groupBy("tipo")                                   //GROUPBY
    res.status(200).json(consulta)
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const treinosVotos = async (req, res) => {
  try {
    const treinos = await dbKnex.select("nome", "votos")
                       .from("treinos").orderBy("votos", "desc")
                       .limit(3)
    res.status(200).json(treinos)
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}


// export const treinosIndex = async (req, res) => {
//   try {
//     // obtém da tabela de produtos todos os registros
//     const treinos = await dbKnex.select("t.*", "a.nome as admins")
//     .from("treinos as t")
//     .innerJoin("admins as a", {"t.usuario_id": "a.id"})
//     res.status(200).json(treinos)
//   } catch (error) {
//     res.status(400).json({ id: 0, msg: "Erro: " + error.message })
//   }
// }

export const treinoLista = async (req, res) => {
  try {
    // obtém da tabela de produtos todos os registros
    const treinos = await dbKnex.select("t.*", "a.nome as admins")
                                  .from("treinos as t")
                                  .innerJoin("admins as a", {"t.usuario_id": "a.id"})

    ejs.renderFile('views/listaTreinos.ejs', {treinos}, (err, html) => {
      if (err) {
        return res.status(400).send("Erro na geração da página")
      }
      res.status(200).send(html)                              
    });
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}


export const treinoPdf = async(req, res) => {
  //  const browser = await puppeteer.launch({headless: false});
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // carrega a página da rota anterior (com a listagem dos produtos)
    await page.goto('http://localhost:3031/treinos/lista');
  
    // aguarda a conclusão da exibição da página com os dados do banco
    await page.waitForNetworkIdle(0)
  
    // gera o pdf da página exibida
    const pdf = await page.pdf({
      printBackground: true,
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
  
    await browser.close();
  
    // define o tipo de retorno deste método
    res.contentType('application/pdf')
  
    res.status(200).send(pdf)
  }