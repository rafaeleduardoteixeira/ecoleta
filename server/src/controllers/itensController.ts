import knex from "../database/connection";
import { Request, Response } from "express";

class ItensController {
  async index(request: Request, response: Response) {
    const items = await knex("itens").select("*");
    const serializedItems = items.map((item) => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://192.168.0.2:3333/uploads/${item.image}`,
      };
    });
    response.json(serializedItems);
  }
}
export default ItensController;
