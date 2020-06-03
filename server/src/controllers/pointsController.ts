import knex from "../database/connection";
import { Request, Response } from "express";

class PointsController {
  async show(request: Request, response: Response) {
    const id = request.params.id;
    const point = await knex("points").where("id", id).first();
    if (!point) {
      return response.status(400).json({ error: "Ponto não encontrato." });
    } else {
      const itens = await knex("itens").join("point_itens", "itens.id", "=", "point_itens.item_id").where("point_itens.point_id", "=", id);
      return response.json({ point, itens });
    }
  }
  async index(request: Request, response: Response) {
    const { city, state, itens } = request.query;
    const parsedItens = String(itens)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("points")
      .join("point_itens", "points.id", "=", "point_itens.point_id")
      .whereIn("point_itens.item_id", parsedItens)
      .where("city", String(city))
      .where("state", String(state))
      .distinct()
      .select("points.*");
    return response.json(points);
  }
  async createPoint(request: Request, response: Response) {
    //Pega conteudo do body
    const { name, email, whatsapp, latitude, longitude, city, state, itens } = request.body;
    //Abre transaction
    const trx = await knex.transaction();
    //Cria constante com o point
    const point = {
      image: "https://images.unsplash.com/photo-1540661116512-12e516d30ce4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2169&q=80",
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
      const pointItens = itens.map((item_id: number) => {
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
