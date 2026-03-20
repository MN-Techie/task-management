import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from '../controllers/task.controller';

const router = Router();

router.get('/', authenticate as RequestHandler, getTasks as RequestHandler);
router.post('/', authenticate as RequestHandler, createTask as RequestHandler);
router.get('/:id', authenticate as RequestHandler, getTask as RequestHandler);
router.patch('/:id', authenticate as RequestHandler, updateTask as RequestHandler);
router.delete('/:id', authenticate as RequestHandler, deleteTask as RequestHandler);
router.post('/:id/toggle', authenticate as RequestHandler, toggleTask as RequestHandler);

export default router;
