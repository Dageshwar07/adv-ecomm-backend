import { Router } from 'express';
const mylistRouter = Router();
import auth from '../middleware/auth.js';
import { addToMyListController, deleteToMyListController, getMyListController } from '../controllers/mylist.controller.js';
mylistRouter.post('/add', auth, addToMyListController);
mylistRouter.delete('/delete/:id', auth, deleteToMyListController);
mylistRouter.get('/get', auth, getMyListController);

export default mylistRouter;