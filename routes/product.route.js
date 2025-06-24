import { deleteImage } from '../controllers/category.controller.js';
import { createProduct, deleteProductById, deleteProductImage, filterProductsByPrice, getAllProducts, getAllProductsByCategoryId, getAllProductsByCategoryName, getAllProductsByRating, getAllProductsByThirdSubCatId, getAllProductsByThirdSubCatName, getFeaturedProducts, getProduct, getProductCount, getProductsBySubCatid, getProductsBySubCatName, updateProduct, uploadProductImages } from '../controllers/product.controller.js';
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
productRouter.get("/by-rating", getAllProductsByRating);
productRouter.get("/count", getProductCount);
productRouter.get("/featured", getFeaturedProducts);
productRouter.delete("/delete/:id", deleteProductById);
productRouter.get('/get/:id', getProduct);
productRouter.delete('/delete-image', deleteProductImage);
productRouter.put('/update/:id', updateProduct);





export default productRouter;
