import React, { useState, useEffect } from "react";
import Calculator from "./Calculator.jsx";
import Catalog from "./Catalog.jsx";
import Expenses from "./Expenses.jsx";
import { defaults } from "./fields.js";
import {
  read,
  validateData,
  dataKey,
  draftKey,
  emptyDraft,
  downloadBackup,
} from "./storage.js";

const pages = {
  calculadora: "Precificar peça",
  catalogo: "Minhas peças",
  gastos: "Gastos do ateliê",
};
function currentPage() {
  const hash = location.hash.slice(1);
  return Object.hasOwn(pages, hash) ? hash : "calculadora";
}
export default function App() {
  const [page, setPage] = useState(currentPage);
  const [data, setData] = useState(() =>
    validateData(read(dataKey, { pieces: [], expenses: [] })),
  );
  const [draft, setDraft] = useState(() => {
    const saved = read(draftKey, null),
      base = emptyDraft();
    return saved?.values
      ? { ...base, ...saved, values: { ...base.values, ...saved.values } }
      : base;
  });
  const [status, setStatus] = useState(""),
    [message, notify] = useState("");
  useEffect(() => {
    function onHash() {
      setPage(currentPage());
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setStatus("Rascunho salvo neste navegador");
    } catch {
      setStatus("Falha ao salvar o rascunho neste navegador");
    }
  }, [draft]);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => notify(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [message]);
  function commit(next) {
    try {
      localStorage.setItem(dataKey, JSON.stringify(next));
      setData(next);
      return true;
    } catch {
      notify(
        "Falha ao salvar. Confira o espaço disponível e exporte seu backup.",
      );
      return false;
    }
  }
  function go(target) {
    location.hash = target;
    setPage(target);
  }
  function save() {
    if (!draft.values.name.trim()) {
      notify("Informe um nome para a peça.");
      return;
    }
    const values = { ...draft.values, name: draft.values.name.trim() };
    for (const key of Object.keys(defaults)) values[key] = Number(values[key]);
    const piece = {
      id: draft.editing || crypto.randomUUID(),
      photo: draft.photo,
      values,
      updated: new Date().toISOString(),
    };
    if (
      commit({
        ...data,
        pieces: [piece, ...data.pieces.filter((p) => p.id !== piece.id)],
      })
    ) {
      setDraft({ ...draft, editing: piece.id });
      notify("Peça salva no catálogo.");
    }
  }
  function openPiece(piece, copy) {
    setDraft({
      values: {
        ...piece.values,
        name: piece.values.name + (copy ? " · cópia" : ""),
      },
      photo: piece.photo,
      editing: copy ? null : piece.id,
    });
    go("calculadora");
  }
  async function importBackup(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (raw.format !== "atelie-v1")
        throw Error("Selecione um backup da Brelu Art.");
      const next = validateData(raw);
      if (
        confirm(
          "Substituir o catálogo e os gastos por " +
            next.pieces.length +
            " peças e " +
            next.expenses.length +
            " gastos?",
        ) &&
        commit(next)
      ) {
        setDraft(emptyDraft());
        notify("Backup importado.");
      }
    } catch (error) {
      notify(error.message);
    }
  }
  return (
    <>
      <aside>
        <a className="brand" href="#calculadora">
          <img
            className="brandlogo"
            src={import.meta.env.BASE_URL + "brelu-art.png"}
            alt="Logo Brelu Art"
          />
          <span>
            Brelu Art<small>CUSTOS &amp; PREÇOS</small>
          </span>
        </a>
        <nav style={{ marginTop: 24 }}>
          {Object.entries(pages).map(([key, label]) => (
            <button
              key={key}
              className={key === page ? "active" : ""}
              onClick={() => go(key)}
            >
              <span>{label}</span>
              {key === "catalogo" && <b>{data.pieces.length}</b>}
            </button>
          ))}
        </nav>
        <div className="asidebottom">
          <span className="statusdot" />
          <span role="status">{status}</span>
          <p>Salve a peça no catálogo para incluí-la no backup.</p>
          <button className="link" onClick={() => downloadBackup(data)}>
            ↓ Exportar backup
          </button>
          <label className="link upload">
            ↑ Importar backup
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={importBackup}
            />
          </label>
        </div>
      </aside>
      <main>
        <section className="intro">
          <div>
            <h1>{pages[page]}</h1>
            <p>
              {
                {
                  calculadora: "Calcule o custo e o preço de venda por peça.",
                  catalogo: "Consulte e edite as peças salvas.",
                  gastos: "Acompanhe as compras e despesas do ateliê por mês.",
                }[page]
              }
            </p>
          </div>
        </section>
        {page === "calculadora" && (
          <Calculator
            draft={draft}
            setDraft={setDraft}
            save={save}
            reset={() => setDraft(emptyDraft())}
            notify={notify}
          />
        )}
        {page === "catalogo" && (
          <Catalog
            pieces={data.pieces}
            onOpen={openPiece}
            onNew={() => {
              setDraft(emptyDraft());
              go("calculadora");
            }}
            onDelete={(p) => {
              if (
                confirm("Excluir " + p.values.name + "?") &&
                commit({
                  ...data,
                  pieces: data.pieces.filter((x) => x.id !== p.id),
                }) &&
                draft.editing === p.id
              )
                setDraft({ ...draft, editing: null });
            }}
          />
        )}
        {page === "gastos" && (
          <Expenses
            expenses={data.expenses}
            onAdd={(item) =>
              commit({ ...data, expenses: [item, ...data.expenses] })
            }
            onDelete={(item) => {
              if (confirm("Excluir este gasto?"))
                commit({
                  ...data,
                  expenses: data.expenses.filter((e) => e.id !== item.id),
                });
            }}
          />
        )}
        <footer>Brelu Art · Custos &amp; Preços</footer>
      </main>
      {message && (
        <div id="toast" style={{ display: "block" }} role="status">
          {message}
        </div>
      )}
    </>
  );
}
