import express from "express";
import PointsController from './controllers/pointsController'
import ItensController from './controllers/itensController'
const routes = express.Router();

//GET
//Request Param
// app.get('/users/:id', (request, response) => {
//     const id = Number(request.params.id);
// })
//Query Param
// app.get('/users?query, (request, response) => {
//     const query = request.query.query
// })
//POST
//app.post('/users', (request, response) => {
//  const data = request.body;
//})

const itensController = new ItensController();
routes.get("/itens", itensController.index);

const pointsController = new PointsController();
routes.post("/points", pointsController.createPoint);
routes.get("/points", pointsController.index);
routes.get("/points/:id", pointsController.show);

export default routes;
