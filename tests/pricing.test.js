import test from "node:test";
import assert from "node:assert/strict";
import { defaults } from "../src/fields.js";
import { calculate } from "../src/pricing.js";
import { validateData } from "../src/storage.js";
test("pintura e taxas por peça em lote", () => {
  const r = calculate({
    ...defaults,
    quantity: 3,
    paintHours: 1,
    paintMinutes: 30,
    paintRate: 4,
    hourRate: 20,
    fee: 15,
    fixed: 4,
  });
  assert.equal(r.parts["Tintas (estimativa)"], 6);
  assert.equal(r.parts["Mão de obra da pintura"], 30);
  assert.ok(Math.abs(r.price - r.cost - r.fees - r.profit) < 1e-9);
  assert.throws(() => calculate({ ...defaults, fee: 70, margin: 30 }));
});
test("backup de peça anterior à seção de pintura mantém o custo", () => {
  const old = { ...defaults, prep: 10, labor: 5 };
  delete old.paintHours;
  delete old.paintMinutes;
  delete old.paintRate;
  const data = validateData({
    pieces: [{ id: "test", values: { name: "Teste", ...old }, photo: "" }],
    expenses: [],
  });
  assert.equal(calculate(data.pieces[0].values).price.toFixed(2), "29.74");
});
