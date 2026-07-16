// API 端点（开发时用本地，部署后自动切换）
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000'
    : 'https://web-production-1fa7e.up.railway.app';

// 发送验证码
async function sendCode() {
    const email = document.getElementById('email').value;
    const btn = document.getElementById('send-code-btn');
    
    if (!email || !email.includes('@')) {
        alert('请输入有效的邮箱地址');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = '发送中...';
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        if (!response.ok) {
            throw new Error('发送失败');
        }
        
        // 显示验证码输入框
        document.getElementById('email-form').style.display = 'none';
        document.getElementById('code-form').style.display = 'flex';
        
        alert('验证码已发送到你的邮箱！');
    } catch (error) {
        alert('发送失败：' + error.message);
        btn.disabled = false;
        btn.textContent = '发送验证码';
    }
}

// 验证验证码
async function verifyCode() {
    const email = document.getElementById('email').value;
    const code = document.getElementById('code').value;
    const btn = document.getElementById('verify-btn');
    
    if (!code || code.length !== 6) {
        alert('请输入6位验证码');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = '验证中...';
    
    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code })
        });
        
        if (!response.ok) {
            throw new Error('验证失败，请检查验证码');
        }
        
        const data = await response.json();
        const token = data.token;
        
        // 保存 token 到 localStorage
        localStorage.setItem('syncagent_token', token);
        
        // 显示成功信息
        document.getElementById('code-form').style.display = 'none';
        document.getElementById('auth-success').style.display = 'block';
        document.getElementById('user-token').textContent = token;
        
        // 显示安装步骤
        document.getElementById('step-install').style.display = 'block';
        document.getElementById('step-usage').style.display = 'block';
        
        // 填充 token 到安装命令
        document.getElementById('token-placeholder').textContent = token;
        document.getElementById('token-placeholder').style.color = '#3b82f6';
        
    } catch (error) {
        alert(error.message);
        btn.disabled = false;
        btn.textContent = '验证';
    }
}

// 复制安装命令
function copyInstruction() {
    const command = document.getElementById('install-command').textContent;
    
    navigator.clipboard.writeText(command).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ 已复制！';
        btn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        alert('复制失败，请手动复制');
    });
}

// 页面加载时检查是否已有 token
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('syncagent_token');
    
    if (token && document.getElementById('step-install')) {
        // 如果已有 token，直接显示安装步骤
        document.getElementById('step-auth').style.display = 'none';
        document.getElementById('auth-success').style.display = 'block';
        document.getElementById('user-token').textContent = token;
        document.getElementById('step-install').style.display = 'block';
        document.getElementById('step-usage').style.display = 'block';
        document.getElementById('token-placeholder').textContent = token;
        document.getElementById('token-placeholder').style.color = '#3b82f6';
    }
});
