import React, { useRef } from "react";
import { groups } from "./fields.js";
import { calculate, money } from "./pricing.js";
import { resizePhoto } from "./storage.js";

function Fields({ group, values, change }) {
  return (
    <div className="fields three" id={group}>
      {groups[group].map(([key, label]) => (
        <label key={key}>
          {label}
          <input
            name={key}
            type="number"
            min={key === "quantity" ? 1 : 0}
            max={["minutes", "paintMinutes"].includes(key) ? 59 : undefined}
            step={
              ["quantity", "minutes", "paintMinutes"].includes(key) ? 1 : "any"
            }
            required
            value={values[key]}
            onChange={change}
          />
        </label>
      ))}
    </div>
  );
}
function Select({ name, label, options, values, change }) {
  return (
    <label>
      {label}
      <select name={name} value={values[name]} onChange={change}>
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}
export default function Calculator({ draft, setDraft, save, reset, notify }) {
  const { values, photo } = draft;
  const latestPhoto = useRef(0);
  const change = ({ target: { name, value } }) =>
    setDraft((old) => ({ ...old, values: { ...old.values, [name]: value } }));
  const props = { values, change };
  let result, error;
  try {
    result = calculate(values);
  } catch (e) {
    error = e.message;
  }
  async function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const sequence = ++latestPhoto.current;
    try {
      const image = await resizePhoto(file);
      if (sequence === latestPhoto.current)
        setDraft((old) => ({ ...old, photo: image }));
    } catch (e) {
      notify(e.message);
    }
  }
  return (
    <div className="workspace">
      <form
        id="pricing"
        onSubmit={(e) => {
          e.preventDefault();
          if (result) save();
        }}
      >
        <div className="panel">
          <div className="sectiontitle">
            <div>
              <h2>A sua criação</h2>
              <p>Use o peso e o tempo do fatiador para o lote inteiro.</p>
            </div>
          </div>
          <div className="identity">
            <label className="photo">
              ＋<small>Foto da peça</small>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={upload}
                hidden
              />
              {photo && <img src={photo} alt="Foto da peça" />}
            </label>
            <div className="identityfields">
              <label>
                Nome da peça
                <input
                  name="name"
                  value={values.name}
                  onChange={change}
                  required
                  maxLength={100}
                  placeholder="Ex.: Boiadeiro · 21 cm"
                />
              </label>
              <div className="fields two">
                <Select
                  {...props}
                  name="category"
                  label="Categoria"
                  options={[
                    "Imagem religiosa",
                    "Figure",
                    "Chaveiro",
                    "Decoração",
                    "Outros",
                  ]}
                />
                <Select
                  {...props}
                  name="version"
                  label="Versão"
                  options={["Crua", "Pintada"]}
                />
              </div>
            </div>
          </div>
          <Fields {...props} group="printFields" />
          <p className="hint">
            Inclua suportes e purga no peso total. O resultado é por peça boa.
          </p>
        </div>
        <div className="panel">
          <div className="sectiontitle">
            <h2>Pintura e acabamento</h2>
          </div>
          <Fields {...props} group="workFields" />
          {result && (
            <p className="paintsummary">
              Por peça: {money(result.parts["Tintas (estimativa)"])} em tintas +{" "}
              {money(result.parts["Mão de obra da pintura"])} de mão de obra da
              pintura.
            </p>
          )}
          <p className="hint">
            Informe o tempo de pintura ativa, sem secagem. Divida o gasto com
            tinta pelas horas pintadas para estimar seu custo por hora.
          </p>
          <details>
            <summary>
              Energia, máquina e reserva para falhas <span>＋</span>
            </summary>
            <Fields {...props} group="machineFields" />
            <p className="hint">
              A reserva incide sobre filamento, energia e máquina. Ajuste os
              valores iniciais à sua operação.
            </p>
          </details>
        </div>
        <div className="panel">
          <div className="sectiontitle">
            <h2>Como você vai vender?</h2>
          </div>
          <Select
            {...props}
            name="channel"
            label="Canal de venda"
            options={["Venda direta", "Shopee", "Mercado Livre", "Outro"]}
          />
          <Fields {...props} group="saleFields" />
          <p className="hint">
            Informe as taxas do seu canal. A margem é calculada sobre o preço de
            venda.
          </p>
        </div>
      </form>
      <div className="resultcolumn">
        <div className="result">
          <div className="resulttop">PREÇO SUGERIDO / PEÇA</div>
          <h2>{values.name || "Sua próxima criação"}</h2>
          <div className="price">{result ? money(result.price) : "—"}</div>
          <span className="marginpill">
            {result
              ? values.margin + "% de margem sobre a venda"
              : "Revise os campos"}
          </span>
          {error && (
            <p role="alert" id="error">
              {error}
            </p>
          )}
          <div className="divider" />
          {[
            ["Custo de produção", "cost"],
            ["Taxas e frete", "fees"],
            ["Lucro estimado", "profit"],
            ["Preço mínimo sem prejuízo", "minimum"],
          ].map(([label, key]) => (
            <div
              key={key}
              className={key === "minimum" ? "minimum" : "resultrow " + key}
            >
              <span>{label}</span>
              <strong>{result ? money(result[key]) : "—"}</strong>
            </div>
          ))}
          <button className="primary" form="pricing" disabled={!result}>
            {draft.editing ? "Atualizar peça" : "Salvar no catálogo"}
          </button>
          <button
            className="ghost"
            onClick={() => {
              latestPhoto.current++;
              reset();
            }}
          >
            Nova simulação
          </button>
        </div>
        {result && (
          <div className="panel breakdown">
            <h3>Para onde vai o custo?</h3>
            {Object.entries(result.parts).map(([label, value]) => (
              <div key={label}>
                <div className="barrow">
                  <span>{label}</span>
                  <b>{money(value)}</b>
                </div>
                <div className="bar">
                  <i
                    style={{
                      width:
                        (result.cost ? (100 * value) / result.cost : 0) + "%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
