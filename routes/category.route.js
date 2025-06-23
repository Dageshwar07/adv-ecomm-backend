import { Router } from 'express';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import { createCategory, deleteCategory, deleteImage, getAllCategories, getCategoryById, getCategoryCount, getSubCategoryCount, updateCategory, uploadImages } from '../controllers/category.controller.js';

const categoryRouter = Router();
categoryRouter.post('/upload/image', auth, upload.array('images'), uploadImages);
categoryRouter.post('/create',auth, createCategory);
categoryRouter.get('/get', getAllCategories);
categoryRouter.get('/get/count', getCategoryCount);
categoryRouter.get('/get/subcount', getSubCategoryCount);
categoryRouter.get('/get/:id', getCategoryById);
categoryRouter.delete('/delete/image', auth, deleteImage);
categoryRouter.delete('/delete/:id', auth, deleteCategory);
categoryRouter.put('/update/:id', auth, updateCategory);

export default categoryRouter;
