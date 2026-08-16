import CustomerRepository from '../repositories/CustomerRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';

class DashboardService {
  async summary(currentUser) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const [recentOrders, customers, products] = await Promise.all([
      OrderRepository.findRecent({ createdById: currentUser.id }, 5),
      CustomerRepository.findForOwner(currentUser.id, { limit: 500 }),
      ProductRepository.findAll(500)
    ]);
    const ordersToday = await OrderRepository.countByCollaboratorFromDate(currentUser.id, start);

    return {
      ordersToday,
      customerBase: customers.filter((customer) => customer.active !== false).length,
      activeProducts: products.filter((product) => product.active !== false).length,
      recentOrders
    };
  }
}

export default new DashboardService();
