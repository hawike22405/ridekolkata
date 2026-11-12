import { Route, Pricing } from "./models.js";
import { routeInput, pricingInput, pageInput } from "./validation.js";
import { routePage, pricingPage } from "./catalog-contract.js";
export function catalogHandler(Model, input, output, ensureDb) {
  return async (req, res) => {
    const { page, limit } = pageInput.parse(req.query);
    await ensureDb();
    const [result] = await Model.aggregate([
      { $match: { enabled: true } },
      { $sort: { _id: 1 } },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          count: [{ $count: "total" }],
        },
      },
    ]).option({ maxTimeMS: 5000 });
    try {
      if (!result) throw new Error();
      const data = result.data.map((doc) => ({
        ...Object.fromEntries(Object.keys(input.shape).map((k) => [k, doc[k]])),
        id: String(doc._id),
        updatedAt: doc.updatedAt.toISOString(),
      }));
      return res.json(
        output.parse({ data, page, limit, total: result.count[0]?.total ?? 0 }),
      );
    } catch {
      throw Object.assign(new Error("Stored catalog is invalid"), {
        status: 503,
      });
    }
  };
}
export function mountCatalog(app, ensureDb) {
  app.get(
    "/api/catalog/routes",
    catalogHandler(Route, routeInput, routePage, ensureDb),
  );
  app.get(
    "/api/catalog/pricing",
    catalogHandler(Pricing, pricingInput, pricingPage, ensureDb),
  );
}
