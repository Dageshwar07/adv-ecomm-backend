import { createProduct, filterProductsByPrice, getAllProducts, getAllProductsByCategoryId, getAllProductsByCategoryName, getAllProductsByThirdSubCatId, getAllProductsByThirdSubCatName, getProductsBySubCatid, getProductsBySubCatName, uploadProductImages } from '../controllers/product.controller.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';  
import { Router } from 'express';
const productRouter = Router();
productRouter.post('/upload/image', auth, upload.array('images'), uploadProductImages)
productRouter.post('/create', auth, createProduct);
productRouter.get('/get', getAllProducts);
productRouter.get('/category/:categoryId',  getAllProductsByCategoryId);
productRouter.get('/category-name/:name', getAllProductsByCategoryName);
productRouter.get('/subcat-id/:subCatid', getProductsBySubCatid);
productRouter.get('/subcat-name/:subcat', getProductsBySubCatName);
productRouter.get('/thirdsubcat-id/:thirdsubCatId', getAllProductsByThirdSubCatId);
productRouter.get('/thirdsubcat-name/:thirdsubCatName', getAllProductsByThirdSubCatName);
productRouter.get("/filterByPrice", filterProductsByPrice);


export default productRouter;
