// API Base URL
const API_BASE_URL = '/api';

// State Management
const state = {
    currentPage: 'dashboard',
    words: [],
    sentences: [],
    grammar: [],
    reviewItems: [],
    stats: null,
    pagination: {
        words: { page: 1, total: 0 },
        sentences: { page: 1, total: 0 },
        grammar: { page: 1, total: 0 }
    },
    charts: {}
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initNavigation();
    initEventListeners();
    loadDashboardData();
});

// Sidebar Toggle
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
}

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav li');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update active nav
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Update page visibility
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    // Update title
    const titles = {
        dashboard: '仪表盘',
        words: '单词管理',
        sentences: '句子翻译',
        grammar: '语法结构',
        review: '复习中心',
        statistics: '数据统计',
        search: '搜索'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    
    state.currentPage = page;
    
    // Load page data
    switch(page) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'words':
            loadWords();
            break;
        case 'sentences':
            loadSentences();
            break;
        case 'grammar':
            loadGrammar();
            break;
        case 'review':
            loadReviewItems();
            break;
        case 'statistics':
            loadStatistics();
            break;
    }
}

// Event Listeners
function initEventListeners() {
    // Quick add button
    document.getElementById('quickAddBtn').addEventListener('click', () => {
        showQuickAddMenu();
    });
    
    // Word search
    document.getElementById('wordSearch').addEventListener('input', debounce(() => {
        state.pagination.words.page = 1;
        loadWords();
    }, 300));
    
    document.getElementById('wordDifficulty').addEventListener('change', () => {
        state.pagination.words.page = 1;
        loadWords();
    });
    
    document.getElementById('wordFavorite').addEventListener('change', () => {
        state.pagination.words.page = 1;
        loadWords();
    });
    
    // Sentence search
    document.getElementById('sentenceSearch').addEventListener('input', debounce(() => {
        state.pagination.sentences.page = 1;
        loadSentences();
    }, 300));
    
    document.getElementById('sentenceType').addEventListener('change', () => {
        state.pagination.sentences.page = 1;
        loadSentences();
    });
    
    // Grammar search
    document.getElementById('grammarSearch').addEventListener('input', debounce(() => {
        state.pagination.grammar.page = 1;
        loadGrammar();
    }, 300));
    
    document.getElementById('grammarDifficulty').addEventListener('change', () => {
        state.pagination.grammar.page = 1;
        loadGrammar();
    });
    
    document.getElementById('grammarMastered').addEventListener('change', () => {
        state.pagination.grammar.page = 1;
        loadGrammar();
    });
    
    // Review filters
    document.querySelectorAll('.review-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.review-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterReviewItems(btn.dataset.filter);
        });
    });
    
    // Global search
    document.getElementById('globalSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// API Functions
async function apiRequest(url, options = {}) {
    showLoading();
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        hideLoading();
        return data;
    } catch (error) {
        hideLoading();
        showToast('error', '请求失败', error.message);
        throw error;
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const data = await apiRequest(`${API_BASE_URL}/dashboard/`);
        
        // Update stats
        document.getElementById('totalWords').textContent = data.total_words;
        document.getElementById('totalSentences').textContent = data.total_sentences;
        document.getElementById('totalGrammar').textContent = data.total_grammar;
        document.getElementById('todayWords').textContent = data.today_words;
        document.getElementById('todaySentences').textContent = data.today_sentences;
        document.getElementById('todayGrammar').textContent = data.today_grammar;
        document.getElementById('streakDays').textContent = data.study_streak;
        
        // Update review badge
        const toReview = data.total_words + data.total_sentences + data.total_grammar;
        document.getElementById('toReview').textContent = toReview;
        document.getElementById('reviewBadge').textContent = toReview;
        
        // Update activity list
        updateActivityList(data.recent_activities);
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

function updateActivityList(activities) {
    const container = document.getElementById('activityList');
    
    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <p>暂无学习活动</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.action}</p>
                <span>${activity.time}</span>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(type) {
    const icons = {
        word: 'fa-book',
        sentence: 'fa-comment-dots',
        grammar: 'fa-spell-check'
    };
    return icons[type] || 'fa-circle';
}

// Load Words
async function loadWords() {
    try {
        const search = document.getElementById('wordSearch').value;
        const difficulty = document.getElementById('wordDifficulty').value;
        const isFavorite = document.getElementById('wordFavorite').value;
        
        let url = `${API_BASE_URL}/words/?page=${state.pagination.words.page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (difficulty) url += `&difficulty=${difficulty}`;
        if (isFavorite) url += `&is_favorite=${isFavorite}`;
        
        const data = await apiRequest(url);
        state.words = data.results || data;
        renderWordsTable();
        renderPagination('words', data.count || state.words.length);
    } catch (error) {
        console.error('Failed to load words:', error);
    }
}

function renderWordsTable() {
    const tbody = document.getElementById('wordsTableBody');
    
    if (state.words.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-book"></i>
                    <p>暂无单词数据</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = state.words.map(word => `
        <tr onclick="showWordDetail(${word.id})">
            <td onclick="event.stopPropagation()">
                <input type="checkbox" value="${word.id}">
            </td>
            <td><strong>${escapeHtml(word.word)}</strong></td>
            <td><em>${escapeHtml(word.phonetic || '-')}</em></td>
            <td>${escapeHtml(word.meaning)}</td>
            <td><span class="difficulty ${word.difficulty}">${getDifficultyLabel(word.difficulty)}</span></td>
            <td>${word.review_count}</td>
            <td onclick="event.stopPropagation()">
                <button class="btn-icon" onclick="toggleWordFavorite(${word.id}, ${!word.is_favorite})" title="${word.is_favorite ? '取消收藏' : '收藏'}">
                    <i class="fas ${word.is_favorite ? 'fa-star' : 'fa-star-o'}"></i>
                </button>
                <button class="btn-icon" onclick="reviewWord(${word.id})" title="复习">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="btn-icon" onclick="deleteWord(${word.id})" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load Sentences
async function loadSentences() {
    try {
        const search = document.getElementById('sentenceSearch').value;
        const type = document.getElementById('sentenceType').value;
        
        let url = `${API_BASE_URL}/sentences/?page=${state.pagination.sentences.page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (type) url += `&type=${type}`;
        
        const data = await apiRequest(url);
        state.sentences = data.results || data;
        renderSentencesGrid();
        renderPagination('sentences', data.count || state.sentences.length);
    } catch (error) {
        console.error('Failed to load sentences:', error);
    }
}

function renderSentencesGrid() {
    const container = document.getElementById('sentencesGrid');
    
    if (state.sentences.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-dots"></i>
                <h3>暂无句子数据</h3>
                <p>点击"添加句子"按钮开始添加</p>
                <button class="btn btn-primary" onclick="openModal('sentence')">
                    <i class="fas fa-plus"></i> 添加句子
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.sentences.map(sentence => `
        <div class="sentence-card" onclick="showSentenceDetail(${sentence.id})">
            <p class="english">${escapeHtml(sentence.english)}</p>
            <p class="chinese">${escapeHtml(sentence.chinese)}</p>
            <div class="meta">
                <span class="type">${getSentenceTypeLabel(sentence.sentence_type)}</span>
                <div class="actions" onclick="event.stopPropagation()">
                    <button class="btn-icon" onclick="toggleSentenceFavorite(${sentence.id}, ${!sentence.is_favorite})">
                        <i class="fas ${sentence.is_favorite ? 'fa-star' : 'fa-star-o'}"></i>
                    </button>
                    <button class="btn-icon" onclick="reviewSentence(${sentence.id})">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteSentence(${sentence.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load Grammar
async function loadGrammar() {
    try {
        const search = document.getElementById('grammarSearch').value;
        const difficulty = document.getElementById('grammarDifficulty').value;
        const isMastered = document.getElementById('grammarMastered').value;
        
        let url = `${API_BASE_URL}/grammar/?page=${state.pagination.grammar.page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (difficulty) url += `&difficulty=${difficulty}`;
        if (isMastered) url += `&is_mastered=${isMastered}`;
        
        const data = await apiRequest(url);
        state.grammar = data.results || data;
        renderGrammarGrid();
        renderPagination('grammar', data.count || state.grammar.length);
    } catch (error) {
        console.error('Failed to load grammar:', error);
    }
}

function renderGrammarGrid() {
    const container = document.getElementById('grammarGrid');
    
    if (state.grammar.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-spell-check"></i>
                <h3>暂无语法数据</h3>
                <p>点击"添加语法"按钮开始添加</p>
                <button class="btn btn-primary" onclick="openModal('grammar')">
                    <i class="fas fa-plus"></i> 添加语法
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.grammar.map(item => `
        <div class="grammar-card" onclick="showGrammarDetail(${item.id})">
            <div class="header">
                <h4 class="title">${escapeHtml(item.title)}</h4>
                <span class="difficulty ${item.difficulty}">${getGrammarDifficultyLabel(item.difficulty)}</span>
            </div>
            <div class="structure">${escapeHtml(item.structure)}</div>
            <p class="category">${escapeHtml(item.category)}</p>
            <div class="actions" onclick="event.stopPropagation()">
                <button class="btn btn-sm ${item.is_mastered ? 'btn-success' : 'btn-secondary'}" onclick="toggleGrammarMastered(${item.id}, ${!item.is_mastered})">
                    <i class="fas ${item.is_mastered ? 'fa-check' : 'fa-circle'}"></i>
                    ${item.is_mastered ? '已掌握' : '标记掌握'}
                </button>
                <button class="btn-icon" onclick="deleteGrammar(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load Review Items
async function loadReviewItems() {
    try {
        const data = await apiRequest(`${API_BASE_URL}/review/`);
        state.reviewItems = data;
        document.getElementById('reviewCount').textContent = data.length;
        renderReviewList();
    } catch (error) {
        console.error('Failed to load review items:', error);
    }
}

function renderReviewList(filter = 'all') {
    const container = document.getElementById('reviewList');
    let items = state.reviewItems;
    
    if (filter !== 'all') {
        items = items.filter(item => item.type === filter);
    }
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>太棒了！</h3>
                <p>暂时没有需要复习的内容</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="review-item">
            <div class="review-item-info">
                <span class="review-item-type ${item.type}">${getTypeLabel(item.type)}</span>
                <h4 class="review-item-title">${escapeHtml(item.title)}</h4>
                <p class="review-item-meta">
                    ${item.last_reviewed ? `上次复习: ${formatDate(item.last_reviewed)}` : '从未复习'}
                    · 已复习 ${item.review_count} 次
                </p>
            </div>
            <div class="review-item-actions">
                <button class="btn btn-primary" onclick="reviewItem('${item.type}', ${item.id})">
                    <i class="fas fa-redo"></i> 复习
                </button>
            </div>
        </div>
    `).join('');
}

function filterReviewItems(filter) {
    renderReviewList(filter);
}

// Load Statistics
async function loadStatistics() {
    try {
        const data = await apiRequest(`${API_BASE_URL}/stats/`);
        state.stats = data;
        renderCharts();
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

function renderCharts() {
    // Destroy existing charts
    Object.values(state.charts).forEach(chart => chart.destroy());
    
    // Word Difficulty Chart
    const wordCtx = document.getElementById('wordDifficultyChart').getContext('2d');
    state.charts.word = new Chart(wordCtx, {
        type: 'doughnut',
        data: {
            labels: state.stats.word_by_difficulty.map(d => getDifficultyLabel(d.difficulty)),
            datasets: [{
                data: state.stats.word_by_difficulty.map(d => d.count),
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
    
    // Sentence Type Chart
    const sentenceCtx = document.getElementById('sentenceTypeChart').getContext('2d');
    state.charts.sentence = new Chart(sentenceCtx, {
        type: 'bar',
        data: {
            labels: state.stats.sentence_by_type.map(d => getSentenceTypeLabel(d.sentence_type)),
            datasets: [{
                label: '数量',
                data: state.stats.sentence_by_type.map(d => d.count),
                backgroundColor: '#6366f1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
    
    // Grammar Difficulty Chart
    const grammarCtx = document.getElementById('grammarDifficultyChart').getContext('2d');
    state.charts.grammar = new Chart(grammarCtx, {
        type: 'pie',
        data: {
            labels: state.stats.grammar_by_difficulty.map(d => getGrammarDifficultyLabel(d.difficulty)),
            datasets: [{
                data: state.stats.grammar_by_difficulty.map(d => d.count),
                backgroundColor: ['#3b82f6', '#8b5cf6', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
    
    // Weekly Chart
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    state.charts.weekly = new Chart(weeklyCtx, {
        type: 'line',
        data: {
            labels: state.stats.last_7_days.map(d => d.date),
            datasets: [
                {
                    label: '单词',
                    data: state.stats.last_7_days.map(d => d.words),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                },
                {
                    label: '句子',
                    data: state.stats.last_7_days.map(d => d.sentences),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                },
                {
                    label: '语法',
                    data: state.stats.last_7_days.map(d => d.grammar),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Search
async function performSearch() {
    const query = document.getElementById('globalSearch').value.trim();
    if (!query) return;
    
    try {
        const data = await apiRequest(`${API_BASE_URL}/search/?q=${encodeURIComponent(query)}`);
        renderSearchResults(data);
    } catch (error) {
        console.error('Search failed:', error);
    }
}

function renderSearchResults(data) {
    const container = document.getElementById('searchResults');
    
    let html = '';
    
    if (data.words.length > 0) {
        html += `
            <div class="search-result-section">
                <h4><i class="fas fa-book"></i> 单词 (${data.words.length})</h4>
                <div class="data-table-container">
                    <table class="data-table">
                        <tbody>
                            ${data.words.map(word => `
                                <tr onclick="showWordDetail(${word.id})">
                                    <td><strong>${escapeHtml(word.word)}</strong></td>
                                    <td>${escapeHtml(word.meaning)}</td>
                                    <td><span class="difficulty ${word.difficulty}">${getDifficultyLabel(word.difficulty)}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    if (data.sentences.length > 0) {
        html += `
            <div class="search-result-section">
                <h4><i class="fas fa-comment-dots"></i> 句子 (${data.sentences.length})</h4>
                <div class="sentences-grid">
                    ${data.sentences.map(sentence => `
                        <div class="sentence-card" onclick="showSentenceDetail(${sentence.id})">
                            <p class="english">${escapeHtml(sentence.english)}</p>
                            <p class="chinese">${escapeHtml(sentence.chinese)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (data.grammar.length > 0) {
        html += `
            <div class="search-result-section">
                <h4><i class="fas fa-spell-check"></i> 语法 (${data.grammar.length})</h4>
                <div class="grammar-grid">
                    ${data.grammar.map(item => `
                        <div class="grammar-card" onclick="showGrammarDetail(${item.id})">
                            <div class="header">
                                <h4 class="title">${escapeHtml(item.title)}</h4>
                            </div>
                            <div class="structure">${escapeHtml(item.structure)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (html === '') {
        html = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>未找到结果</h3>
                <p>尝试使用其他关键词搜索</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Modal Functions
let currentFormType = '';
let currentEditId = null;

function openModal(type, editId = null) {
    currentFormType = type;
    currentEditId = editId;
    
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('modalForm');
    
    const titles = {
        word: editId ? '编辑单词' : '添加单词',
        sentence: editId ? '编辑句子' : '添加句子',
        grammar: editId ? '编辑语法' : '添加语法'
    };
    
    title.textContent = titles[type];
    form.innerHTML = getFormFields(type);
    
    modal.classList.add('active');
}

function getFormFields(type) {
    switch(type) {
        case 'word':
            return `
                <div class="form-row">
                    <div class="form-group">
                        <label>单词 *</label>
                        <input type="text" name="word" required>
                    </div>
                    <div class="form-group">
                        <label>音标</label>
                        <input type="text" name="phonetic" placeholder="/ˈɪŋɡlɪʃ/">
                    </div>
                </div>
                <div class="form-group">
                    <label>中文释义 *</label>
                    <input type="text" name="meaning" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>词性</label>
                        <input type="text" name="part_of_speech" placeholder="n. / v. / adj.">
                    </div>
                    <div class="form-group">
                        <label>难度</label>
                        <select name="difficulty">
                            <option value="easy">简单</option>
                            <option value="medium" selected>中等</option>
                            <option value="hard">困难</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>例句</label>
                    <textarea name="example_sentence" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label>例句翻译</label>
                    <textarea name="example_translation" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label>分类</label>
                    <input type="text" name="category" placeholder="如：四六级、雅思、托福">
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="2"></textarea>
                </div>
            `;
        case 'sentence':
            return `
                <div class="form-group">
                    <label>英文句子 *</label>
                    <textarea name="english" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label>中文翻译 *</label>
                    <textarea name="chinese" rows="3" required></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>类型</label>
                        <select name="sentence_type">
                            <option value="translation">翻译练习</option>
                            <option value="daily">日常用语</option>
                            <option value="business">商务英语</option>
                            <option value="academic">学术英语</option>
                            <option value="slang">俚语</option>
                            <option value="quote">名言</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>关键词</label>
                        <input type="text" name="keywords" placeholder="用逗号分隔">
                    </div>
                </div>
                <div class="form-group">
                    <label>语法要点</label>
                    <textarea name="grammar_points" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label>备注</label>
                    <textarea name="notes" rows="2"></textarea>
                </div>
            `;
        case 'grammar':
            return `
                <div class="form-group">
                    <label>语法标题 *</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>语法结构 *</label>
                    <input type="text" name="structure" required placeholder="如：Subject + Verb + Object">
                </div>
                <div class="form-group">
                    <label>详细解释 *</label>
                    <textarea name="explanation" rows="4" required></textarea>
                </div>
                <div class="form-group">
                    <label>用法说明</label>
                    <textarea name="usage" rows="3"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>难度</label>
                        <select name="difficulty">
                            <option value="beginner">初级</option>
                            <option value="intermediate" selected>中级</option>
                            <option value="advanced">高级</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>分类</label>
                        <input type="text" name="category" placeholder="如：时态、从句、虚拟语气">
                    </div>
                </div>
                <div class="form-group">
                    <label>常见错误</label>
                    <textarea name="common_mistakes" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label>学习技巧</label>
                    <textarea name="tips" rows="2"></textarea>
                </div>
            `;
        default:
            return '';
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    currentFormType = '';
    currentEditId = null;
}

async function submitForm() {
    const form = document.getElementById('modalForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Handle array fields
    if (data.examples && typeof data.examples === 'string') {
        data.examples = data.examples.split('\n').filter(e => e.trim());
    }
    
    try {
        const url = currentEditId 
            ? `${API_BASE_URL}/${currentFormType}s/${currentEditId}/`
            : `${API_BASE_URL}/${currentFormType}s/`;
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        await apiRequest(url, {
            method: method,
            body: JSON.stringify(data)
        });
        
        showToast('success', '成功', currentEditId ? '更新成功' : '添加成功');
        closeModal();
        
        // Refresh current page
        switch(state.currentPage) {
            case 'words':
                loadWords();
                break;
            case 'sentences':
                loadSentences();
                break;
            case 'grammar':
                loadGrammar();
                break;
            case 'dashboard':
                loadDashboardData();
                break;
        }
    } catch (error) {
        console.error('Form submission failed:', error);
    }
}

// Detail Modal
async function showWordDetail(id) {
    try {
        const word = await apiRequest(`${API_BASE_URL}/words/${id}/`);
        showDetailModal('单词详情', `
            <div class="detail-content">
                <h2>${escapeHtml(word.word)} <small style="color: #64748b; font-size: 0.6em;">${escapeHtml(word.phonetic || '')}</small></h2>
                <p><strong>释义：</strong>${escapeHtml(word.meaning)}</p>
                <p><strong>词性：</strong>${escapeHtml(word.part_of_speech || '-')}</p>
                <p><strong>难度：</strong><span class="difficulty ${word.difficulty}">${getDifficultyLabel(word.difficulty)}</span></p>
                ${word.example_sentence ? `<p><strong>例句：</strong><br>${escapeHtml(word.example_sentence)}</p>` : ''}
                ${word.example_translation ? `<p><strong>翻译：</strong><br>${escapeHtml(word.example_translation)}</p>` : ''}
                ${word.category ? `<p><strong>分类：</strong>${escapeHtml(word.category)}</p>` : ''}
                ${word.notes ? `<p><strong>备注：</strong>${escapeHtml(word.notes)}</p>` : ''}
                <p><strong>复习次数：</strong>${word.review_count}</p>
            </div>
        `, () => reviewWord(id));
    } catch (error) {
        console.error('Failed to load word detail:', error);
    }
}

async function showSentenceDetail(id) {
    try {
        const sentence = await apiRequest(`${API_BASE_URL}/sentences/${id}/`);
        showDetailModal('句子详情', `
            <div class="detail-content">
                <h3>英文</h3>
                <p style="font-size: 1.125rem; line-height: 1.8;">${escapeHtml(sentence.english)}</p>
                <h3>中文翻译</h3>
                <p style="color: #64748b;">${escapeHtml(sentence.chinese)}</p>
                <p><strong>类型：</strong>${getSentenceTypeLabel(sentence.sentence_type)}</p>
                ${sentence.keywords ? `<p><strong>关键词：</strong>${escapeHtml(sentence.keywords)}</p>` : ''}
                ${sentence.grammar_points ? `<p><strong>语法要点：</strong><br>${escapeHtml(sentence.grammar_points)}</p>` : ''}
                ${sentence.notes ? `<p><strong>备注：</strong>${escapeHtml(sentence.notes)}</p>` : ''}
            </div>
        `, () => reviewSentence(id));
    } catch (error) {
        console.error('Failed to load sentence detail:', error);
    }
}

async function showGrammarDetail(id) {
    try {
        const grammar = await apiRequest(`${API_BASE_URL}/grammar/${id}/`);
        const examples = Array.isArray(grammar.examples) ? grammar.examples : [];
        
        showDetailModal('语法详情', `
            <div class="detail-content">
                <h2>${escapeHtml(grammar.title)}</h2>
                <div class="structure" style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0; font-family: monospace;">
                    ${escapeHtml(grammar.structure)}
                </div>
                <h3>详细解释</h3>
                <p>${escapeHtml(grammar.explanation)}</p>
                ${grammar.usage ? `<h3>用法说明</h3><p>${escapeHtml(grammar.usage)}</p>` : ''}
                <h3>例句</h3>
                <ul>
                    ${examples.map(ex => `<li>${escapeHtml(ex)}</li>`).join('')}
                </ul>
                ${grammar.common_mistakes ? `<h3>常见错误</h3><p style="color: #ef4444;">${escapeHtml(grammar.common_mistakes)}</p>` : ''}
                ${grammar.tips ? `<h3>学习技巧</h3><p style="color: #10b981;">${escapeHtml(grammar.tips)}</p>` : ''}
            </div>
        `, () => reviewGrammar(id));
    } catch (error) {
        console.error('Failed to load grammar detail:', error);
    }
}

function showDetailModal(title, content, actionCallback) {
    document.getElementById('detailModalTitle').textContent = title;
    document.getElementById('detailModalBody').innerHTML = content;
    document.getElementById('detailActionBtn').onclick = () => {
        actionCallback();
        closeDetailModal();
    };
    document.getElementById('detailModal').classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Review Functions
async function reviewWord(id) {
    try {
        await apiRequest(`${API_BASE_URL}/words/${id}/review/`, { method: 'POST' });
        showToast('success', '复习完成', '单词复习记录已更新');
        if (state.currentPage === 'words') loadWords();
        else if (state.currentPage === 'review') loadReviewItems();
    } catch (error) {
        console.error('Failed to review word:', error);
    }
}

async function reviewSentence(id) {
    try {
        await apiRequest(`${API_BASE_URL}/sentences/${id}/review/`, { method: 'POST' });
        showToast('success', '复习完成', '句子复习记录已更新');
        if (state.currentPage === 'sentences') loadSentences();
        else if (state.currentPage === 'review') loadReviewItems();
    } catch (error) {
        console.error('Failed to review sentence:', error);
    }
}

async function reviewGrammar(id) {
    try {
        await apiRequest(`${API_BASE_URL}/grammar/${id}/review/`, { method: 'POST' });
        showToast('success', '复习完成', '语法复习记录已更新');
        if (state.currentPage === 'grammar') loadGrammar();
        else if (state.currentPage === 'review') loadReviewItems();
    } catch (error) {
        console.error('Failed to review grammar:', error);
    }
}

function reviewItem(type, id) {
    switch(type) {
        case 'word':
            reviewWord(id);
            break;
        case 'sentence':
            reviewSentence(id);
            break;
        case 'grammar':
            reviewGrammar(id);
            break;
    }
}

// Toggle Functions
async function toggleWordFavorite(id, isFavorite) {
    try {
        await apiRequest(`${API_BASE_URL}/words/${id}/toggle_favorite/`, { method: 'POST' });
        showToast('success', '操作成功', isFavorite ? '已添加到收藏' : '已取消收藏');
        loadWords();
    } catch (error) {
        console.error('Failed to toggle favorite:', error);
    }
}

async function toggleSentenceFavorite(id, isFavorite) {
    try {
        await apiRequest(`${API_BASE_URL}/sentences/${id}/toggle_favorite/`, { method: 'POST' });
        showToast('success', '操作成功', isFavorite ? '已添加到收藏' : '已取消收藏');
        loadSentences();
    } catch (error) {
        console.error('Failed to toggle favorite:', error);
    }
}

async function toggleGrammarMastered(id, isMastered) {
    try {
        await apiRequest(`${API_BASE_URL}/grammar/${id}/toggle_mastered/`, { method: 'POST' });
        showToast('success', '操作成功', isMastered ? '已标记为掌握' : '已标记为未掌握');
        loadGrammar();
    } catch (error) {
        console.error('Failed to toggle mastered:', error);
    }
}

// Delete Functions
async function deleteWord(id) {
    if (!confirm('确定要删除这个单词吗？')) return;
    
    try {
        await apiRequest(`${API_BASE_URL}/words/${id}/`, { method: 'DELETE' });
        showToast('success', '删除成功', '单词已删除');
        loadWords();
    } catch (error) {
        console.error('Failed to delete word:', error);
    }
}

async function deleteSentence(id) {
    if (!confirm('确定要删除这个句子吗？')) return;
    
    try {
        await apiRequest(`${API_BASE_URL}/sentences/${id}/`, { method: 'DELETE' });
        showToast('success', '删除成功', '句子已删除');
        loadSentences();
    } catch (error) {
        console.error('Failed to delete sentence:', error);
    }
}

async function deleteGrammar(id) {
    if (!confirm('确定要删除这个语法吗？')) return;
    
    try {
        await apiRequest(`${API_BASE_URL}/grammar/${id}/`, { method: 'DELETE' });
        showToast('success', '删除成功', '语法已删除');
        loadGrammar();
    } catch (error) {
        console.error('Failed to delete grammar:', error);
    }
}

// Pagination
function renderPagination(type, total) {
    const container = document.getElementById(`${type}Pagination`);
    const perPage = 20;
    const totalPages = Math.ceil(total / perPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    const currentPage = state.pagination[type].page;
    
    // Previous button
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage('${type}', ${currentPage - 1})">上一页</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage('${type}', ${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span>...</span>`;
        }
    }
    
    // Next button
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage('${type}', ${currentPage + 1})">下一页</button>`;
    
    container.innerHTML = html;
}

function changePage(type, page) {
    state.pagination[type].page = page;
    switch(type) {
        case 'words':
            loadWords();
            break;
        case 'sentences':
            loadSentences();
            break;
        case 'grammar':
            loadGrammar();
            break;
    }
}

// Utility Functions
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getDifficultyLabel(difficulty) {
    const labels = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
    };
    return labels[difficulty] || difficulty;
}

function getGrammarDifficultyLabel(difficulty) {
    const labels = {
        beginner: '初级',
        intermediate: '中级',
        advanced: '高级'
    };
    return labels[difficulty] || difficulty;
}

function getSentenceTypeLabel(type) {
    const labels = {
        translation: '翻译练习',
        daily: '日常用语',
        business: '商务英语',
        academic: '学术英语',
        slang: '俚语',
        quote: '名言'
    };
    return labels[type] || type;
}

function getTypeLabel(type) {
    const labels = {
        word: '单词',
        sentence: '句子',
        grammar: '语法'
    };
    return labels[type] || type;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Quick Add Menu
function showQuickAddMenu() {
    const options = [
        { label: '添加单词', icon: 'fa-book', action: () => openModal('word') },
        { label: '添加句子', icon: 'fa-comment-dots', action: () => openModal('sentence') },
        { label: '添加语法', icon: 'fa-spell-check', action: () => openModal('grammar') }
    ];
    
    // Simple implementation - just open word modal as default
    openModal('word');
}

// Close modals on outside click
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    const detailModal = document.getElementById('detailModal');
    
    if (event.target === modal) {
        closeModal();
    }
    if (event.target === detailModal) {
        closeDetailModal();
    }
}
