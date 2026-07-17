// API 端点（开发时用本地，部署后自动切换）
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://web-production-1fa7e.up.railway.app';

// Google 登录回调（由 Google Identity Services 调用）
async function handleGoogleLogin(response) {
    // response.credential 是 Google 返回的 ID token (JWT)
    const credential = response.credential;

    if (!credential) {
        alert('Google 登录失败：未获取到凭证');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || '登录失败');
        }

        const data = await res.json();
        onAuthSuccess(data.token);
    } catch (error) {
        alert('登录失败：' + error.message);
    }
}

// 登录成功后的通用处理
function onAuthSuccess(token) {
    // 保存 token 到 localStorage
    localStorage.setItem('syncagent_token', token);

    // 刷新顶部登录状态导航
    renderAuthNav();

    // 以下仅 setup 页存在，别的页面容错跳过
    const googleForm = document.getElementById('google-form');
    if (googleForm) googleForm.style.display = 'none';

    const success = document.getElementById('auth-success');
    if (success) success.style.display = 'block';

    const userToken = document.getElementById('user-token');
    if (userToken) userToken.textContent = token;

    const stepInstall = document.getElementById('step-install');
    if (stepInstall) stepInstall.style.display = 'block';

    const stepUsage = document.getElementById('step-usage');
    if (stepUsage) stepUsage.style.display = 'block';

    // 填充 token 到安装命令
    const placeholder = document.getElementById('token-placeholder');
    if (placeholder) {
        placeholder.textContent = token;
        placeholder.style.color = '#3b82f6';
    }
}

// 复制安装命令
function copyInstruction(btn) {
    const command = document.getElementById('install-command').textContent;
    btn = btn || document.querySelector('.copy-button');

    const showCopied = () => {
        if (!btn) return;
        const originalText = btn.textContent;
        btn.textContent = '✓ 已复制！';
        btn.style.backgroundColor = '#10b981';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    };

    // 回退方案：用临时 textarea + execCommand
    const fallbackCopy = () => {
        try {
            const ta = document.createElement('textarea');
            ta.value = command;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            if (ok) {
                showCopied();
            } else {
                alert('复制失败，请手动选择命令文本复制');
            }
        } catch (e) {
            alert('复制失败，请手动选择命令文本复制');
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(command).then(showCopied).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
}

// 退出登录（全站通用）
function logout() {
    localStorage.removeItem('syncagent_token');
    window.location.href = '/index.html';
}

// 从 JWT 里解出邮箱（仅用于展示，不做校验）
function emailFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.email || '';
    } catch (e) {
        return '';
    }
}

// 渲染统一的顶部登录状态导航（所有页面共用 #nav-actions 容器）
function renderAuthNav() {
    const nav = document.getElementById('nav-actions');
    if (!nav) return;

    const token = localStorage.getItem('syncagent_token');

    if (!token) {
        nav.innerHTML =
            '<a href="/docs.html" class="nav-btn nav-btn-ghost">文档</a>' +
            '<a href="/setup.html" class="nav-btn nav-btn-primary">登录 / 开始使用</a>';
        return;
    }

    const email = emailFromToken(token);
    nav.innerHTML =
        (email ? '<span class="nav-user" title="' + email + '">' + email + '</span>' : '') +
        '<a href="/backups.html" class="nav-btn">我的备份</a>' +
        '<a href="/setup.html" class="nav-btn nav-btn-ghost">安装命令</a>' +
        '<button type="button" class="nav-btn nav-btn-ghost" id="nav-logout">退出</button>';

    const btn = document.getElementById('nav-logout');
    if (btn) btn.addEventListener('click', logout);
}

// 页面加载：渲染导航；在 setup 页若已登录直接展示后续步骤
window.addEventListener('DOMContentLoaded', () => {
    renderAuthNav();

    const token = localStorage.getItem('syncagent_token');
    if (token && document.getElementById('step-install')) {
        document.getElementById('step-auth').style.display = 'none';
        onAuthSuccess(token);
    }
});
