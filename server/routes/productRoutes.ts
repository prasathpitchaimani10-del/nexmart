import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();

router.get('/', ProductController.getProducts);
router.get('/suggestions', ProductController.getSearchSuggestions);
router.get('/check-delivery', ProductController.checkDeliveryAvailability);
router.get('/compare', ProductController.compareProducts);
router.get('/:slug', ProductController.getProductBySlug);

export default router;
