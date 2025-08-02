import express from 'express';
import { createFlashSale, updateFlashSale, deleteFlashSale, getActiveFlashSale, } from '../controllers/flashSaleController.js';

const router = express.Router();

router.get('/active', getActiveFlashSale);
router.post('/', createFlashSale);
router.put('/:id', updateFlashSale);
router.delete('/:id', deleteFlashSale);

export default router;
