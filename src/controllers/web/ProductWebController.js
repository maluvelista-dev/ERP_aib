import ProductService from '../../services/ProductService.js';
import ProductCategoryService from '../../services/ProductCategoryService.js';
import AuditService from '../../services/AuditService.js';

class ProductWebController {
  async index(req, res) {
    const selectedCategoryId = req.query.categoryId ?? '';
    const search = req.query.q ?? '';
    const editMode = req.query.edit === 'true' && req.currentUser?.role === 'admin';
    const [result, categories] = await Promise.all([
      ProductService.paginate({
        categoryId: selectedCategoryId,
        search,
        includeInactive: editMode,
        page: req.query.page
      }),
      ProductCategoryService.list()
    ]);

    res.render('products/index', {
      title: 'Produtos',
      products: result.items,
      pagination: result.pagination,
      paginationQuery: { q: search, categoryId: selectedCategoryId, ...(editMode ? { edit: 'true' } : {}) },
      categories,
      selectedCategoryId,
      search,
      editMode
    });
  }

  async new(req, res) {
    const categories = await ProductCategoryService.list();

    res.render('products/new', {
      title: 'Novo Produto',
      product: {},
      categories,
      error: res.locals.flash?.error ?? null
    });
  }

  async create(req, res) {
    try {
      const product = await ProductService.create(req.body);
      await AuditService.log({ actorId: req.currentUser.id, action: 'PRODUCT_CREATED', entityType: 'PRODUCT', entityId: product.id });
      req.session.flash = { success: 'Produto criado com sucesso.' };
      res.redirect('/products');
    } catch (error) {
      res.status(error.statusCode ?? 422).render('products/new', {
        title: 'Novo Produto',
        product: req.body,
        categories: await ProductCategoryService.list(),
        error: error.message
      });
    }
  }

  async update(req, res) {
    const returnTo = req.body.returnTo?.startsWith('/products') ? req.body.returnTo : '/products?edit=true';
    const { returnTo: _returnTo, ...payload } = req.body;

    try {
      await ProductService.update(req.params.id, payload);
      await AuditService.log({ actorId: req.currentUser.id, action: 'PRODUCT_UPDATED', entityType: 'PRODUCT', entityId: req.params.id });
      req.session.flash = { success: 'Produto atualizado com sucesso.' };
      res.redirect(returnTo);
    } catch (error) {
      req.session.flash = { error: error.message };
      res.redirect(returnTo);
    }
  }
}

export default new ProductWebController();
