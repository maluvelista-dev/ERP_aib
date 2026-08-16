import DashboardService from '../../services/DashboardService.js';

class DashboardWebController {
  async show(req, res) {
    const summary = await DashboardService.summary(req.currentUser);

    res.render('dashboard/show', {
      title: 'Dashboard',
      summary
    });
  }
}

export default new DashboardWebController();
