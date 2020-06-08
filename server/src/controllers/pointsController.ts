import knex from "../database/connection";
import { Request, Response } from "express";

class PointsController {
  async show(request: Request, response: Response) {
    const id = request.params.id;
    const point = await knex("points").where("id", id).first();

    const serializedPoint = {
        ...point,
        image: `http://192.168.0.2:3333/uploads/${point.image}`
    };

    if (!point) {
      return response.status(400).json({ error: "Ponto não encontrato." });
    } else {
      const itens = await knex("itens").join("point_itens", "itens.id", "=", "point_itens.item_id").where("point_itens.point_id", "=", id);
      return response.json({ point: serializedPoint, itens });
    }
  }
  async index(request: Request, response: Response) {
    const { city, state, itens } = request.query;
    const parsedItens = String(itens)
      .split(",")
      .map((item) => Number(item.trim().replace('[','').replace(']','')));

    let points
    let serializedPoints 
    if (parsedItens[0]!==0){
       points= await knex("points")
      .join("point_itens", "points.id", "=", "point_itens.point_id")
      .whereIn("point_itens.item_id", parsedItens)
      .where("city", String(city))
      .where("state", String(state))
      .distinct()
      .select("points.*");

      serializedPoints = points.map((point) => {
        return {
          ...point,
          image: `http://192.168.0.2:3333/uploads/${point.image}`
        };
      });
    }else{
       points = await knex("points")
      .join("point_itens", "points.id", "=", "point_itens.point_id")
      .where("city", String(city))
      .where("state", String(state))
      .distinct()
      .select("points.*");      

      serializedPoints = points.map((point) => {
        return {
          ...point,
          image: `http://192.168.0.2:3333/uploads/${point.image}`
        };      
      });
    }
    return response.json(serializedPoints);
  }
  async createPoint(request: Request, response: Response) {
    //Pega conteudo do body
    const {name, email, whatsapp, latitude, longitude, city, state, itens } = request.body;
    //Abre transaction
    const trx = await knex.transaction();
    //Cria constante com o point
    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      state,
    };
    //Salva registro e rotorna os ids salvo
    try {

      const insertedId = await trx("points").insert(point);
      //Cria constante com os itens da requisição
      const pointItens = itens.split(',').map((item:string) => Number(item.trim())).map((item_id: number) => {
        return {
          item_id,
          point_id: insertedId[0],
        };
      });
      //Salva itens do point
      await trx("point_itens").insert(pointItens);
      //Commita transação
      await trx.commit();
      return response.json({ id: insertedId[0], ...point });
    } catch (e) {
       //Rollback transação
       await trx.rollback();
       return response.json({ error: "Erro ao salvar registros." });
    }
    //Retorna o point salvo (novoid, constante point criada acima)
  }
}
export default PointsController;
