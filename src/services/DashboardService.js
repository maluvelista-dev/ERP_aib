import CustomerRepository from '../repositories/CustomerRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';

class DashboardService {
  async summary(currentUser) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const [recentOrders, customerBase, activeProducts, ordersToday, totalOrders] = await Promise.all([
      OrderRepository.findRecent({ createdById: currentUser.id }, 5),
      CustomerRepository.countActive(currentUser.id),
      ProductRepository.countActive(currentUser.id),
      OrderRepository.countFromDate(start, currentUser.id),
      OrderRepository.countAll(currentUser.id)
    ]);
    const summary = {
      ordersToday,
      customerBase,
      activeProducts,
      totalOrders,
      recentOrders,
      global: null
    };

    if (currentUser.role === 'admin') {
      const [globalOrdersToday, globalCustomerBase, globalTotalOrders, globalRecentOrders] = await Promise.all([
        OrderRepository.countFromDate(start),
        CustomerRepository.countActive(),
        OrderRepository.countAll(),
        OrderRepository.findRecent({}, 5)
      ]);
      summary.global = {
        ordersToday: globalOrdersToday,
        customerBase: globalCustomerBase,
        activeProducts,
        totalOrders: globalTotalOrders,
        recentOrders: globalRecentOrders
      };
    }

    return summary;
  }
}

export default new DashboardService();
