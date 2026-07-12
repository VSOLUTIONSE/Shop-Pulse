import { Router, type IRouter } from "express";
import aiReportsRouter from "./aiReports";
import backupRouter from "./backup";
import categoriesRouter from "./categories";
import customersRouter from "./customers";
import dashboardRouter from "./dashboard";
import expensesRouter from "./expenses";
import healthRouter from "./health";
import productsRouter from "./products";
import salesRouter from "./sales";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(settingsRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(customersRouter);
router.use(salesRouter);
router.use(expensesRouter);
router.use(dashboardRouter);
router.use(aiReportsRouter);
router.use(backupRouter);

export default router;
