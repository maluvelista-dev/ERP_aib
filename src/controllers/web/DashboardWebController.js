import DashboardService from '../../services/DashboardService.js';

class DashboardWebController {
  async show(_req, res) {
    const summary = await DashboardService.summary();

    res.render('dashboard/show', {
      title: 'Dashboard',
      summary
    });
  }
}

export default new DashboardWebController();
