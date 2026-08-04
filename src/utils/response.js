export const ok = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ data });
};

export const created = (res, data) => {
  return ok(res, data, 201);
};
//padroniza respostas