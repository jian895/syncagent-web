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

    // 隐藏登录表单，显示成功信息
    const googleForm = document.getElementById('google-form');
    if (googleForm) googleForm.style.display = 'none';
    document.getElementById('auth-success').style.display = 'block';
    document.getElementById('user-token').textContent = token;

    // 显示后续步骤
    document.getElementById('step-install').style.display = 'block';
    document.getElementById('step-usage').style.display = 'block';

    // 填充 token 到安装命令
    const placeholder = document.getElementById('token-placeholder');
    placeholder.textContent = token;
    placeholder.style.color = '#3b82f6';
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

// 页面加载时检查是否已登录
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('syncagent_token');

    if (token && document.getElementById('step-install')) {
        document.getElementById('step-auth').style.display = 'none';
        onAuthSuccess(token);
    }
});
