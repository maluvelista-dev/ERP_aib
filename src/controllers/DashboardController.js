import DashboardService from '../services/DashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

class DashboardController {
  summary = asyncHandler(async (_req, res) => {
    return ok(res, await DashboardService.summary());
  });
}

export default new DashboardController();
