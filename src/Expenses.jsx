import React, { useState } from "react";
import { money } from "./pricing.js";
import { today } from "./storage.js";
export default function Expenses({ expenses, onAdd, onDelete }) {
  const [month, setMonth] = useState(today().slice(0, 7));
  const rows = expenses
    .filter((e) => e.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));
  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget,
      v = Object.fromEntries(new FormData(form));
    const item = {
      ...v,
      description: v.description.trim(),
      amount: Number(v.amount),
      id: crypto.randomUUID(),
    };
    if (item.description && onAdd(item)) {
      form.reset();
      setMonth(item.date.slice(0, 7));
    }
  }
  return (
    <div className="expensegrid">
      <form className="panel" id="expenseForm" onSubmit={submit}>
        <h2>Registrar gasto</h2>
        <label>
          Descrição
          <input name="description" required maxLength={120} />
        </label>
        <label>
          Categoria
          <select name="kind">
            {[
              "Filamento",
              "Pintura e acabamento",
              "Embalagens",
              "Equipamentos",
              "Outros",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <div className="fields two">
          <label>
            Valor (R$)
            <input type="number" name="amount" min=".01" step=".01" required />
          </label>
          <label>
            Data
            <input type="date" name="date" defaultValue={today()} required />
          </label>
        </div>
        <button className="primary">Adicionar gasto</button>
      </form>
      <div className="panel">
        <div className="expensehead">
          <h2>Seus gastos</h2>
          <input
            type="month"
            aria-label="Filtrar mês"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="expenseTotal">
          {money(rows.reduce((s, e) => s + e.amount, 0))}
        </div>
        {rows.map((e) => (
          <div className="expenseitem" key={e.id}>
            <div>
              {e.description}
              <small>
                {e.kind} · {e.date.split("-").reverse().join("/")}
              </small>
            </div>
            <strong>{money(e.amount)}</strong>
            <button
              aria-label={"Excluir " + e.description}
              onClick={() => onDelete(e)}
            >
              ×
            </button>
          </div>
        ))}
        {!rows.length && <p>Nenhum gasto registrado neste período.</p>}
      </div>
    </div>
  );
}
