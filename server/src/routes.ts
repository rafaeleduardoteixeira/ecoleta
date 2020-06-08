import express from "express";
import PointsController from './controllers/pointsController'
import ItensController from './controllers/itensController'
import multer from 'multer';
import multerConfig from '../config/multer'

const routes = express.Router();
const uploadFile = multer(multerConfig);

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
routes.get("/points", pointsController.index);
routes.get("/points/:id", pointsController.show);
routes.post("/points", uploadFile.single('image'), pointsController.createPoint);

export default routes;
