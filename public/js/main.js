const FALLBACK_CONFIG = {
  site: {
    name: 'Nhóm 4 - TKHDQ',
    tagline: 'Website giới thiệu thành viên và tổng hợp bài tập của nhóm',
    email: 'dinhminhtoan17062009@gmail.com',
    phone: '0399124922',
    address: 'THPT chuyên Bến Tre, Vĩnh Long'
  },
  members: [
    { id: 'dinhminhtoan', name: 'Đinh Minh Toàn', role: 'Nhóm trưởng', photo: 'images/members/nguyenvana.jpg' },
    { id: 'nguyenthienanhkhoa', name: 'Nguyễn Thiện Anh Khoa', role: 'Thành viên', photo: 'images/members/tranthib.jpg' },
    { id: 'trankhanghuy', name: 'Trần Khang Huy', role: 'Thành viên', photo: 'images/members/levanc.jpg' },
    { id: 'trandaiphat', name: 'Trần Đại Phát', role: 'Thành viên', photo: 'images/members/phamthid.jpg' },
    { id: 'tranminhquan', name: 'Trần Minh Quân', role: 'Thành viên', photo: 'images/members/hoangvane.jpg' }
  ],
  documents: [
    { id: 'baitap1', filename: 'baitap1.json', title: 'Bài tập 1 - Giới thiệu nhóm', order: 1, html: '<h1>Bài tập 1</h1><p>Nhóm 5 gồm 5 thành viên.</p>' },
    { id: 'baitap2', filename: 'baitap2.json', title: 'Bài tập 2 - Phân tích yêu cầu', order: 2, html: '<h2>Bài tập 2</h2><p>Website cần có trang chủ, thành viên, bài tập.</p>' }
  ]
};

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function getConfig() {
  if (window.SITE_DATA && typeof window.SITE_DATA === 'object') {
    return window.SITE_DATA;
  }

  try {
    const res = await fetch('data/sample-data.json');
    if (!res.ok) throw new Error('Không tìm thấy data/sample-data.json');
    const data = await res.json();
    if (data && typeof data === 'object') return data;
  } catch (error) {
    console.warn('Dùng dữ liệu mặc định:', error.message);
  }
  return FALLBACK_CONFIG;
}

function applySiteName(siteName) {
  const name = siteName || 'Website';
  document.querySelectorAll('#site-name').forEach(el => {
    el.textContent = name;
  });
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) heroTitle.textContent = name;
  const footerName = document.getElementById('footer-name');
  if (footerName) footerName.textContent = name;
}

function applySiteMeta(site = {}) {
  applySiteName(site.name);
  const heroTagline = document.getElementById('hero-tagline');
  if (heroTagline) heroTagline.textContent = site.tagline || 'Giới thiệu thành viên và bài tập nhóm';
  const footerTagline = document.getElementById('footer-tagline');
  if (footerTagline) footerTagline.textContent = site.tagline || '';
  const footerEmail = document.getElementById('footer-email');
  if (footerEmail) footerEmail.textContent = site.email || '';
  const footerPhone = document.getElementById('footer-phone');
  if (footerPhone) footerPhone.textContent = site.phone || '';
  const footerAddress = document.getElementById('footer-address');
  if (footerAddress) footerAddress.textContent = site.address || '';
}

function renderMembers(members = []) {
  const host = document.getElementById('members-grid');
  if (!host) return;
  if (!Array.isArray(members) || members.length === 0) {
    host.innerHTML = '<p class="empty-state">Chưa có thành viên nào.</p>';
    return;
  }

  host.innerHTML = members.map(member => `
    <article class="member-card">
      <a href="member.html?id=${encodeURIComponent(member.id)}" class="member-link">
        <img src="${escapeHtml(member.photo || 'images/members/nguyenvana.jpg')}" alt="${escapeHtml(member.name || 'Thành viên')}" class="member-photo">
        <div class="member-info">
          <h3>${escapeHtml(member.name || 'Thành viên')}</h3>
          <p class="member-role">${escapeHtml(member.role || 'Thành viên')}</p>
        </div>
      </a>
    </article>
  `).join('');
}

function renderDocuments(documents = []) {
  const host = document.getElementById('exercises-grid');
  if (!host) return;
  if (!Array.isArray(documents) || documents.length === 0) {
    host.innerHTML = '<p class="empty-state">Chưa có bài tập nào.</p>';
    return;
  }

  const sorted = [...documents].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  host.innerHTML = sorted.map(doc => `
    <article class="exercise-card">
      <a href="exercise.html?id=${encodeURIComponent(doc.id)}" class="exercise-link">
        <span class="exercise-number">${escapeHtml(doc.order || '0')}</span>
        <h3>${escapeHtml(doc.title || doc.filename || 'Bài tập')}</h3>
        <p>${escapeHtml(doc.filename || '')}</p>
      </a>
    </article>
  `).join('');
}

async function initIndex() {
  try {
    const config = await getConfig();
    applySiteMeta(config.site || {});
    renderMembers(config.members || []);
    renderDocuments(config.documents || []);
  } catch (error) {
    console.error('Lỗi khi khởi tạo trang chủ:', error);
  }
}

async function initMember() {
  const id = getQueryParam('id');
  const container = document.getElementById('member-container');
  if (!container) return;

  try {
    const config = await getConfig();
    applySiteMeta(config.site || {});

    if (!id) {
      container.innerHTML = '<p class="error">Không có ID thành viên.</p>';
      return;
    }

    const member = (config.members || []).find(item => item.id === id);
    if (!member) {
      container.innerHTML = '<p class="error">Không tìm thấy thành viên.</p>';
      return;
    }

    const skills = Array.isArray(member.skills) ? member.skills : [];
    container.innerHTML = `
      <article class="member-detail">
        <div class="member-detail-header">
          <img src="${escapeHtml(member.photo || 'images/members/nguyenvana.jpg')}" alt="${escapeHtml(member.name || 'Thành viên')}" class="member-detail-photo">
          <div>
            <h1>${escapeHtml(member.name || 'Thành viên')}</h1>
            <p class="member-detail-role">${escapeHtml(member.role || 'Thành viên')}</p>
          </div>
        </div>
        <div class="member-detail-grid">
          <div class="detail-card">
            <h3>Thông tin cá nhân</h3>
            <p><strong>Ngày sinh:</strong> ${escapeHtml(member.birthday || '')}</p>
            <p><strong>Mã sinh viên:</strong> ${escapeHtml(member.studentId || '')}</p>
            <p><strong>Lớp:</strong> ${escapeHtml(member.class || '')}</p>
            <p><strong>Email:</strong> ${escapeHtml(member.email || '')}</p>
            <p><strong>Điện thoại:</strong> ${escapeHtml(member.phone || '')}</p>
          </div>
          <div class="detail-card">
            <h3>Giới thiệu</h3>
            <p>${escapeHtml(member.intro || 'Chưa có giới thiệu.')}</p>
          </div>
        </div>
        <div class="detail-card">
          <h3>Kỹ năng</h3>
          <div class="skill-list">
            ${skills.length ? skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('') : '<span>Chưa có kỹ năng</span>'}
          </div>
        </div>
      </article>
    `;
  } catch (error) {
    console.error('Lỗi khi load thành viên:', error);
    container.innerHTML = '<p class="error">Không thể tải thông tin thành viên.</p>';
  }
}

async function initExercise() {
  const id = getQueryParam('id');
  const container = document.getElementById('exercise-container');
  if (!container) return;

  try {
    const config = await getConfig();
    applySiteMeta(config.site || {});

    if (!id) {
      container.innerHTML = '<p class="error">Không có ID bài tập.</p>';
      return;
    }

    const doc = (config.documents || []).find(item => item.id === id);
    if (!doc) {
      container.innerHTML = '<p class="error">Không tìm thấy bài tập.</p>';
      return;
    }

    document.title = doc.title || doc.filename || 'Bài tập';
    container.innerHTML = `
      <article class="exercise-detail">
        <h1>${escapeHtml(doc.title || doc.filename || 'Bài tập')}</h1>
        <span class="file-tag">${escapeHtml(doc.filename || '')}</span>
        <div class="docx-content">${doc.html || '<p>File không có nội dung.</p>'}</div>
      </article>
    `;
  } catch (error) {
    console.error('Lỗi khi load bài tập:', error);
    container.innerHTML = '<p class="error">Không thể tải bài tập.</p>';
  }
}