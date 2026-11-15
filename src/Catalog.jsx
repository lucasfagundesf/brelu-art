import React, { useState } from "react";
import { calculate, money } from "./pricing.js";
export default function Catalog({ pieces, onOpen, onDelete, onNew }) {
  const [search, setSearch] = useState(""),
    [version, setVersion] = useState("");
  const rows = pieces.filter(
    (p) =>
      p.values.name.toLowerCase().includes(search.toLowerCase()) &&
      (!version || p.values.version === version),
  );
  return (
    <>
      <div className="toolbar">
        <input
          aria-label="Buscar peça"
          placeholder="Buscar uma peça…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filtrar versão"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        >
          <option value="">Todas as versões</option>
          <option>Crua</option>
          <option>Pintada</option>
        </select>
        <button className="primary" onClick={onNew}>
          ＋ Nova peça
        </button>
      </div>
      <div className="cards">
        {rows.map((piece) => {
          const v = piece.values,
            r = calculate(v);
          return (
            <article key={piece.id} className="card">
              <div className="cardvisual">
                {piece.photo ? <img src={piece.photo} alt={v.name} /> : "◈"}
              </div>
              <div className="cardbody">
                <div className="cardmeta">
                  {v.category} · {v.version}
                </div>
                <h3>{v.name}</h3>
                <div className="cardprice">{money(r.price)}</div>
                <p>
                  Custo {money(r.cost)} · Margem {v.margin}%
                </p>
                <div className="actions">
                  <button onClick={() => onOpen(piece, false)}>
                    Editar cálculo
                  </button>
                  <button onClick={() => onOpen(piece, true)}>Duplicar</button>
                  <button onClick={() => onDelete(piece)}>Excluir</button>
                </div>
              </div>
            </article>
          );
        })}
        {!rows.length && (
          <div className="empty">
            {pieces.length
              ? "Nenhuma peça encontrada."
              : "Salve sua primeira peça na calculadora para iniciar o catálogo."}
          </div>
        )}
      </div>
    </>
  );
}
