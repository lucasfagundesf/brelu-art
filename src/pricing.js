import { defaults } from "./fields.js";
export const money = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function normalize(values) {
  if (values.paintHours !== undefined) return { ...values };
  return {
    ...values,
    paintHours: 0,
    paintMinutes: 0,
    paintRate: 0,
    labor: values.labor + (values.prep || 0) / values.quantity,
  };
}
export function calculate(raw) {
  const values = normalize(raw);
  const v = { ...values };
  for (const key of Object.keys(defaults)) {
    if (
      v[key] === "" ||
      v[key] == null ||
      !Number.isFinite(Number(v[key])) ||
      Number(v[key]) < 0
    )
      throw Error("Preencha todos os custos com números positivos ou zero.");
    v[key] = Number(v[key]);
  }
  if (
    !Number.isInteger(v.quantity) ||
    v.quantity < 1 ||
    v.rollWeight <= 0 ||
    v.life <= 0 ||
    [v.minutes, v.paintMinutes].some((m) => m >= 60 || !Number.isInteger(m))
  )
    throw Error(
      "Confira a quantidade, o peso do rolo, a vida útil e os minutos adicionais (0 a 59).",
    );
  const machineHours = (v.hours + v.minutes / 60) / v.quantity;
  const filament = (v.grams * v.rollPrice) / v.rollWeight / v.quantity;
  const energy = ((machineHours * v.watts) / 1000) * v.kwh;
  const machine = machineHours * (v.machine / v.life + v.maintenance);
  const painting = v.paintHours + v.paintMinutes / 60;
  const parts = {
    Filamento: filament,
    Energia: energy,
    "Máquina e manutenção": machine,
    "Reserva para falhas": ((filament + energy + machine) * v.failure) / 100,
    "Mão de obra da pintura": painting * v.hourRate,
    "Tintas (estimativa)": painting * v.paintRate,
    "Montagem e outros trabalhos": (v.labor / 60) * v.hourRate,
    "Outros materiais de acabamento": v.finish,
    Embalagem: v.pack,
    "Outros custos": v.other / v.quantity,
  };
  const cost = Object.values(parts).reduce((sum, n) => sum + n, 0);
  const rate = (v.fee + v.tax + v.ads) / 100,
    margin = v.margin / 100;
  if (rate + margin >= 1)
    throw Error("Taxas e margem precisam somar menos de 100%.");
  const base = cost + v.fixed + v.shipping,
    price = base / (1 - rate - margin);
  return {
    parts,
    cost,
    price,
    profit: price * margin,
    minimum: base / (1 - rate),
    fees: price * rate + v.fixed + v.shipping,
  };
}
