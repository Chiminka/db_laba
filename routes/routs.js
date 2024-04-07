import { Router } from 'express';
import { AllSelectsService } from '../services/selects.js';
import { block } from '../utils/block.js';

const allSelectsService = new AllSelectsService();

const router = new Router();

//1)	Сервісні центри, де є в наявності конкретна деталь для ремонту
// http://localhost:3002/api/select/1
router.post('/1', allSelectsService.Select_1);

//2)	Усі ремонти за конкретним гарантійним талоном (ремонти можуть бути в різних сервісах)
// http://localhost:3002/api/select/2
router.post('/2', allSelectsService.Select_2);

//3)	Усі ремонти за продуктом у всіх сервісах.
// http://localhost:3002/api/select/3
router.post('/3', allSelectsService.Select_3);

//4)	Поточні ремонти у вибраних сервісах
// http://localhost:3002/api/select/4
router.get('/4', allSelectsService.Select_4);

//5)	Додавання нового ремонту за гарантійним талоном, перевіривши, чи не використаний він наразі в ремонті в іншому вузлі
// http://localhost:3002/api/select/5
router.post('/5', allSelectsService.Select_5);

//6)	Передача ремонту в інший сервіс
// http://localhost:3002/api/select/6
router.post('/6', allSelectsService.Select_6);

//7)	Редагування
// http://localhost:3002/api/select/7
router.post('/7', block, allSelectsService.Select_7);

//8)	Видалення
// /http://localhost:3002/api/select/8
router.delete('/8', block, allSelectsService.Select_8);

export default router;
