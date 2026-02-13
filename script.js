const USERNAME = "heejun6905-create";
const USER_ENDPOINT = `https://api.github.com/users/${USERNAME}`;
const REPOS_ENDPOINT = `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=6&type=owner`;

const fmtDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function renderProfile(user) {
  document.getElementById("avatar").src = user.avatar_url;
  document.getElementById("name").textContent = user.name || user.login;
  document.getElementById("bio").textContent =
    user.bio || "GitHub 데이터를 기반으로 자동 구성된 개인 홈페이지입니다.";
  document.getElementById("profileLink").href = user.html_url;
  document.getElementById("followers").textContent = user.followers;
  document.getElementById("following").textContent = user.following;
  document.getElementById("publicRepos").textContent = user.public_repos;
  document.getElementById("joinedAt").textContent = fmtDate(user.created_at);
  document.getElementById("footerName").textContent = user.name || user.login;
}

function renderRepos(repos) {
  const reposEl = document.getElementById("repos");

  if (!repos.length) {
    reposEl.innerHTML = `<p class="muted">아직 공개 저장소가 없습니다. 저장소를 public으로 전환하면 여기에 자동으로 표시됩니다.</p>`;
    return;
  }

  reposEl.innerHTML = repos
    .map(
      (repo) => `
      <article class="repo-card">
        <h3>
          <a href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a>
        </h3>
        <p class="repo-desc">${repo.description || "설명이 없습니다."}</p>
        <div class="meta">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>🍴 ${repo.forks_count}</span>
          <span>${repo.language || "언어 없음"}</span>
          <span>업데이트: ${fmtDate(repo.updated_at)}</span>
        </div>
      </article>
    `
    )
    .join("");
}

async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();

  try {
    const [userRes, reposRes] = await Promise.all([fetch(USER_ENDPOINT), fetch(REPOS_ENDPOINT)]);
    if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API 요청 실패");

    const [user, repos] = await Promise.all([userRes.json(), reposRes.json()]);
    renderProfile(user);
    renderRepos(repos);
  } catch (error) {
    document.getElementById("bio").textContent =
      "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
    document.getElementById("repos").innerHTML = `<p class="muted">오류가 발생했습니다: ${error.message}</p>`;
  }
}

init();
