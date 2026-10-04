import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';

const router = Router();

router.get('/', CategoryController.getCategories);
router.get('/:slug', CategoryController.getCategoryBySlug);

export default router;
