import './portal.css';

// games/ 以下に game.json を追加すると、ゲーム一覧へ自動的に登録されます。
const gameModules = import.meta.glob('../games/*/game.json', {
  eager: true,
  import: 'default',
});

const games = Object.values(gameModules).sort((firstGame, secondGame) =>
  firstGame.order - secondGame.order,
);

const gameGrid = document.querySelector('#game-grid');

function createTag(label) {
  const tag = document.createElement('span');
  tag.className = 'tech-tag';
  tag.textContent = label;
  return tag;
}

function createGameCard(game) {
  const article = document.createElement('article');
  article.className = 'game-card';

  const header = document.createElement('div');
  header.className = 'game-card-visual';
  header.style.setProperty('--game-accent', game.accentColor);
  header.innerHTML = `
    <span class="game-number">GAME ${String(game.order).padStart(2, '0')}</span>
    <span class="game-symbol" aria-hidden="true">${game.symbol}</span>
    <span class="status-badge">${game.status}</span>
  `;

  const body = document.createElement('div');
  body.className = 'game-card-body';

  const title = document.createElement('h3');
  title.textContent = game.title;
  const description = document.createElement('p');
  description.textContent = game.description;

  const tags = document.createElement('div');
  tags.className = 'tech-tags';
  game.technologies.forEach((technology) => tags.append(createTag(technology)));

  const progress = document.createElement('div');
  progress.className = 'game-progress';
  progress.innerHTML = `
    <div><span>学習フェーズ</span><strong>${game.phaseCount}</strong></div>
    <div class="progress-track"><span style="width: ${game.progressPercent}%"></span></div>
  `;

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  actions.innerHTML = `
    <a class="button button-primary" href="${game.paths.portal}">ゲームを体験</a>
    <a class="text-link" href="${game.paths.dashboard}">学習ダッシュボード →</a>
  `;

  body.append(title, description, tags, progress, actions);
  article.append(header, body);
  return article;
}

if (games.length === 0) {
  gameGrid.innerHTML = '<p class="empty-state">ゲーム教材を準備中です。</p>';
} else {
  games.forEach((game) => gameGrid.append(createGameCard(game)));
}
