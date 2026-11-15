# Brelu Art — Custos & Preços
Painel em React com JavaScript e Vite. Inclui calculadora de impressão e pintura, catálogo com fotos, registro de gastos, rascunho automático e backup JSON.

## Rodar no computador
Use Node.js 22.12+ ou 24. Abra a pasta que contém este README no VS Code e rode:
```sh
npm ci
npm run dev
```
Abra o endereço mostrado no terminal. Para conferir os cálculos e testar a versão de produção:
```sh
npm test
npm run build
npm run preview
```

## Subir para o GitHub
1. Crie um repositório vazio, por exemplo `brelu-art`. Crie-o sem README ou licença para usar os comandos abaixo.
2. Extraia o ZIP e abra um terminal dentro da pasta que contém `package.json` e `.github`.
3. Troque SEU-USUARIO e o nome do repositório na URL abaixo e rode:
```sh
git init
git add .
git commit -m "Adiciona painel Brelu Art em React"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/brelu-art.git
git push -u origin main
```
4. Para publicar o site, vá a **Settings → Pages → Build and deployment → Source** e selecione **GitHub Actions**. Em **Actions → Publicar painel no GitHub Pages → Run workflow**, selecione `main` e execute. Os próximos pushes em `main` publicam automaticamente. O endereço aparece no ambiente `github-pages` quando o deploy termina.

## Levar seus dados para o novo endereço
Salve a peça em edição no catálogo e exporte o backup no painel antigo. No painel novo, clique em **Importar backup**, confira as quantidades e confirme. A importação substitui o catálogo e os gastos do navegador atual. O rascunho da calculadora é local e fica fora do arquivo de backup.

Os registros ficam em localStorage no dispositivo e no endereço em que você usa o painel. O projeto inclui o código e a logo. O GitHub Pages serve os arquivos estáticos e não oferece o mesmo controle de acesso do painel privado original. Evite colocar backups pessoais no repositório.

## Onde editar
- `src/Calculator.jsx`, `Catalog.jsx` e `Expenses.jsx` contêm as telas.
- `src/fields.js` define os campos e os valores iniciais.
- `src/pricing.js` contém as fórmulas.
- `src/storage.js` trata armazenamento, fotos e backups.
- `src/styles.css` e `public/brelu-art.png` definem o visual.
