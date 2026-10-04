import { Router } from 'express';
import { QuestionController } from '../controllers/questionController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', QuestionController.getProductQuestions);
router.post('/', authenticateJwt, QuestionController.askQuestion);

export default router;
