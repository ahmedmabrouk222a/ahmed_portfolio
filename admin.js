/**
 * AHMED MABROUK PORTFOLIO — ADMIN DASHBOARD CONTROLLER
 * Real-time message synchronization with Server API & LocalStorage Fallback
 */

document.addEventListener("DOMContentLoaded", () => {
  let messages = [];
  let currentSearchQuery = "";
  let currentStatusFilter = "all";
  let currentTopicFilter = "all";

  // DOM Elements
  const container = document.getElementById("messages-container");
  const statTotal = document.getElementById("stat-total");
  const statUnread = document.getElementById("stat-unread");
  const statToday = document.getElementById("stat-today");
  const statTopTopic = document.getElementById("stat-top-topic");

  const searchInput = document.getElementById("admin-search-input");
  const clearSearchBtn = document.getElementById("clear-search-btn");
  const statusFilter = document.getElementById("status-filter");
  const topicFilter = document.getElementById("topic-filter");

  const btnCreateTest = document.getElementById("btn-create-test");
  const btnExportCsv = document.getElementById("btn-export-csv");
  const btnClearAll = document.getElementById("btn-clear-all");
  const btnLogout = document.getElementById("btn-admin-logout");

  const modal = document.getElementById("admin-message-modal");
  const modalContent = document.getElementById("admin-modal-content");
  const modalClose = document.getElementById("admin-modal-close");
  const toast = document.getElementById("admin-toast");

  // Authentication Elements & Constants
  const ADMIN_PASS = "8080";
  const authOverlay = document.getElementById("admin-auth-overlay");
  const authCard = authOverlay ? authOverlay.querySelector(".auth-card") : null;
  const loginForm = document.getElementById("admin-login-form");
  const passInput = document.getElementById("admin-pass-input");
  const togglePassBtn = document.getElementById("toggle-pass-visibility");
  const eyeIcon = document.getElementById("eye-icon");
  const authErrorMsg = document.getElementById("auth-error-msg");

  function isAuth() {
    return sessionStorage.getItem("admin_authenticated") === "true";
  }

  function getAdminKey() {
    return sessionStorage.getItem("admin_key") || "";
  }

  // Show Toast Helper
  function showToast(msg, icon = "fa-circle-check") {
    if (!toast) return;
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: #bbf246;"></i> <span>${msg}</span>`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  // Format Date Helper
  function formatDate(isoString) {
    if (!isoString) return "Just now";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;

      const now = new Date();
      const diffMs = now - d;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  }

  // Get Initials for Avatar
  function getInitials(name) {
    if (!name) return "AM";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Get CSS class for topic badge
  function getTopicClass(subject) {
    const s = (subject || "").toLowerCase();
    if (s.includes("ai") || s.includes("machine learning") || s.includes("deep learning")) {
      return "topic-ai";
    }
    if (s.includes("react") || s.includes("front-end")) {
      return "topic-react";
    }
    if (s.includes("integration") || s.includes("full-stack")) {
      return "topic-integration";
    }
    if (s.includes("role") || s.includes("contract") || s.includes("hiring")) {
      return "topic-hiring";
    }
    return "topic-general";
  }

  // 1. Fetch Messages (Server API with LocalStorage merge)
  async function loadMessages() {
    if (!isAuth()) {
      return;
    }

    let serverList = [];
    let localList = [];

    // LocalStorage load
    try {
      localList = JSON.parse(localStorage.getItem("portfolio_messages") || "[]");
    } catch (e) {
      localList = [];
    }

    // Server API load
    try {
      const res = await fetch("/api/messages", {
        headers: { "x-admin-key": getAdminKey() }
      });
      if (res.ok) {
        serverList = await res.json();
      } else if (res.status === 401) {
        lockDashboard();
        return;
      }
    } catch (err) {
      // Server not reachable (static file preview or offline)
    }

    // Merge without duplicates (keyed by ID or email+date)
    const map = new Map();
    [...serverList, ...localList].forEach(msg => {
      if (msg && (msg.id || msg.date)) {
        const key = msg.id || `${msg.email}_${msg.date}`;
        if (!map.has(key)) {
          map.set(key, msg);
        }
      }
    });

    messages = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Keep localStorage in sync
    try {
      localStorage.setItem("portfolio_messages", JSON.stringify(messages));
    } catch (e) {}

    updateStats();
    renderMessages();
  }

  // 2. Update Stats Counter
  function updateStats() {
    const total = messages.length;
    const unread = messages.filter(m => !m.read).length;

    // Today's inquiries
    const todayStr = new Date().toDateString();
    const todayCount = messages.filter(m => {
      try {
        return new Date(m.date).toDateString() === todayStr;
      } catch {
        return false;
      }
    }).length;

    // Top topic calculation
    const topicCounts = {};
    messages.forEach(m => {
      const top = m.subject || "General";
      topicCounts[top] = (topicCounts[top] || 0) + 1;
    });

    let topTopicName = "—";
    let maxCount = 0;
    for (const [topic, count] of Object.entries(topicCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topTopicName = topic.replace(" Solution", "").replace(" Web Application", "");
      }
    }

    if (statTotal) statTotal.textContent = total;
    if (statUnread) statUnread.textContent = unread;
    if (statToday) statToday.textContent = todayCount;
    if (statTopTopic) statTopTopic.textContent = topTopicName;
  }

  // 3. Render Messages List
  function renderMessages() {
    if (!container) return;

    // Filter Logic
    let filtered = messages.filter(msg => {
      // Status filter
      if (currentStatusFilter === "unread" && msg.read) return false;
      if (currentStatusFilter === "read" && !msg.read) return false;

      // Topic filter
      if (currentTopicFilter !== "all" && msg.subject !== currentTopicFilter) return false;

      // Search keyword filter
      if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        const n = (msg.name || "").toLowerCase();
        const e = (msg.email || "").toLowerCase();
        const s = (msg.subject || "").toLowerCase();
        const m = (msg.message || "").toLowerCase();
        return n.includes(q) || e.includes(q) || s.includes(q) || m.includes(q);
      }

      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fa-solid fa-inbox"></i>
          </div>
          <h3 class="empty-title">${currentSearchQuery || currentStatusFilter !== 'all' || currentTopicFilter !== 'all' ? "No matching inquiries found" : "No client inquiries yet"}</h3>
          <p class="empty-desc">${currentSearchQuery ? "Try refining your search keyword or clearing active filters." : "When clients or recruiters submit the contact form on your portfolio, their messages will appear here instantly."}</p>
          <button class="btn btn-secondary btn-sm" id="empty-add-test">
            <i class="fa-solid fa-plus"></i>
            <span>Add Sample Inquiry</span>
          </button>
        </div>
      `;

      const emptyBtn = document.getElementById("empty-add-test");
      if (emptyBtn) emptyBtn.addEventListener("click", addTestMessage);
      return;
    }

    container.innerHTML = filtered.map(msg => {
      const isUnread = !msg.read;
      const initials = getInitials(msg.name);
      const topicClass = getTopicClass(msg.subject);
      const formattedTime = formatDate(msg.date);
      const mailtoLink = `mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent("Re: " + (msg.subject || "Your Inquiry to Ahmed Mabrouk"))}&body=${encodeURIComponent("Hi " + msg.name + ",\n\nThank you for reaching out regarding:\n\"" + msg.message.slice(0, 100) + "...\"\n\nBest regards,\nAhmed Mabrouk\nAI & Data Science Engineer")}`;

      return `
        <article class="message-card ${isUnread ? 'unread' : 'read'}" data-id="${msg.id}">
          <div class="message-card-header">
            <div class="sender-profile-row">
              <div class="avatar-circle">
                ${initials}
              </div>
              <div class="sender-details">
                <div class="sender-name-wrap">
                  <span class="sender-name">${escapeHtml(msg.name)}</span>
                  ${isUnread ? `<span class="badge-unread-pill">New</span>` : ""}
                </div>
                <a href="mailto:${escapeHtml(msg.email)}" class="sender-email">
                  <i class="fa-regular fa-envelope"></i>
                  <span>${escapeHtml(msg.email)}</span>
                </a>
              </div>
            </div>

            <div class="message-meta-right">
              <span class="topic-badge ${topicClass}">
                <i class="fa-solid fa-tag"></i>
                <span>${escapeHtml(msg.subject || "General Inquiry")}</span>
              </span>
              <span class="message-time" title="${msg.date || ''}">
                <i class="fa-regular fa-clock"></i>
                <span>${formattedTime}</span>
              </span>
            </div>
          </div>

          <div class="message-card-body">
            <p class="message-text">${escapeHtml(msg.message)}</p>
          </div>

          <div class="message-card-footer">
            <div class="card-actions-left">
              <a href="${mailtoLink}" class="action-btn reply-btn" title="Reply via your email client">
                <i class="fa-solid fa-reply"></i>
                <span>Reply</span>
              </a>
              <button class="action-btn btn-toggle-read" data-id="${msg.id}" title="${isUnread ? 'Mark as Read' : 'Mark as Unread'}">
                <i class="fa-solid ${isUnread ? 'fa-envelope-open' : 'fa-envelope'}"></i>
                <span>${isUnread ? 'Mark Read' : 'Mark Unread'}</span>
              </button>
              <button class="action-btn btn-view-modal" data-id="${msg.id}" title="View details in modal">
                <i class="fa-solid fa-expand"></i>
                <span>Details</span>
              </button>
            </div>

            <button class="action-btn delete-btn btn-delete" data-id="${msg.id}" title="Delete inquiry">
              <i class="fa-regular fa-trash-can"></i>
              <span>Delete</span>
            </button>
          </div>
        </article>
      `;
    }).join("");

    bindCardActions();
  }

  // 4. Bind Message Card Actions
  function bindCardActions() {
    // Toggle Read
    document.querySelectorAll(".btn-toggle-read").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await toggleReadStatus(id);
      });
    });

    // Delete
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this message?")) {
          await deleteMessage(id);
        }
      });
    });

    // View Modal
    document.querySelectorAll(".btn-view-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        openDetailModal(id);
      });
    });
  }

  // Toggle Read Helper
  async function toggleReadStatus(id) {
    const item = messages.find(m => m.id === id);
    if (!item) return;

    item.read = !item.read;

    // Sync to local
    localStorage.setItem("portfolio_messages", JSON.stringify(messages));

    // Sync to server API
    try {
      await fetch(`/api/messages/${id}/toggle-read`, {
        method: "PATCH",
        headers: { "x-admin-key": getAdminKey() }
      });
    } catch (e) {}

    updateStats();
    renderMessages();
    showToast(item.read ? "Message marked as read" : "Message marked as unread", item.read ? "fa-envelope-open" : "fa-envelope");
  }

  // Delete Message Helper
  async function deleteMessage(id) {
    messages = messages.filter(m => m.id !== id);

    // Sync to local
    localStorage.setItem("portfolio_messages", JSON.stringify(messages));

    // Sync to server API
    try {
      await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": getAdminKey() }
      });
    } catch (e) {}

    updateStats();
    renderMessages();
    showToast("Message deleted successfully", "fa-trash-can");
  }

  // Open Detail Modal
  function openDetailModal(id) {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    // Automatically mark read when viewed
    if (!msg.read) {
      toggleReadStatus(id);
    }

    const initials = getInitials(msg.name);
    const topicClass = getTopicClass(msg.subject);
    const mailtoLink = `mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent("Re: " + (msg.subject || "Your Inquiry to Ahmed Mabrouk"))}&body=${encodeURIComponent("Hi " + msg.name + ",\n\nThank you for reaching out regarding your project.\n\nBest regards,\nAhmed Mabrouk")}`;

    modalContent.innerHTML = `
      <div class="modal-header-section">
        <div class="modal-sender-top">
          <div class="avatar-circle" style="width: 56px; height: 56px; font-size: 1.2rem;">
            ${initials}
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 4px 0; color: #11130e;">${escapeHtml(msg.name)}</h2>
            <a href="mailto:${escapeHtml(msg.email)}" style="color: #585c50; font-size: 0.95rem; text-decoration: none;">
              <i class="fa-regular fa-envelope"></i> ${escapeHtml(msg.email)}
            </a>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top: 12px;">
          <span class="topic-badge ${topicClass}">
            <i class="fa-solid fa-tag"></i> ${escapeHtml(msg.subject || "General Inquiry")}
          </span>
          <span class="message-time">
            <i class="fa-regular fa-calendar"></i> ${new Date(msg.date).toLocaleString()}
          </span>
        </div>
      </div>

      <h4 style="font-size: 0.9rem; font-weight: 700; color: #868c7e; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Message Content</h4>
      <div class="modal-message-box">
        ${escapeHtml(msg.message)}
      </div>

      <div class="modal-actions-bar">
        <a href="${mailtoLink}" class="btn btn-primary" style="padding: 10px 20px;">
          <i class="fa-solid fa-paper-plane"></i>
          <span>Send Reply to ${escapeHtml(msg.name.split(' ')[0])}</span>
        </a>

        <button class="btn btn-secondary" id="modal-delete-btn" style="padding: 10px 18px; color: #dc2626;">
          <i class="fa-regular fa-trash-can"></i>
          <span>Delete Inquiry</span>
        </button>
      </div>
    `;

    const modalDeleteBtn = document.getElementById("modal-delete-btn");
    if (modalDeleteBtn) {
      modalDeleteBtn.addEventListener("click", async () => {
        if (confirm("Delete this message?")) {
          closeModal();
          await deleteMessage(id);
        }
      });
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  // 5. Add Sample Test Inquiry
  const sampleInquiries = [
    {
      name: "Eng. Kareem Mostafa",
      email: "kareem.mostafa@nexus-ai.com",
      subject: "AI & Machine Learning Solution",
      message: "Hello Ahmed, I saw your Deep Learning and Computer Vision projects on your portfolio. We are building a smart vision inspection system for an industrial client and would like to hire you as a consultant or contract engineer."
    },
    {
      name: "Elena Rostova",
      email: "elena@fintech-berlin.de",
      subject: "Front-End / React Web Application",
      message: "Hi Ahmed! We loved your responsive web portfolios and clean UI design. We have a React + TypeScript analytics dashboard that needs a talented developer for a 3-month project."
    },
    {
      name: "Omar Al-Mansoor",
      email: "omar.mansoor@gulftech.sa",
      subject: "End-to-End AI Web App Integration",
      message: "Peace be upon you Ahmed. We want to develop an enterprise RAG assistant with a custom React frontend that connects to our internal knowledge base. Can we arrange a Google Meet call to discuss scope and pricing?"
    },
    {
      name: "Laila Sherif",
      email: "laila.hr@innovate-egypt.org",
      subject: "Full-Time / Contract Role Discussion",
      message: "Dear Ahmed, Your graduation honors at Beni Suef National University and your leadership background caught our attention. We have an open AI & Data Science Engineer position that matches your profile."
    }
  ];

  async function addTestMessage() {
    const randomSample = sampleInquiries[Math.floor(Math.random() * sampleInquiries.length)];
    const newMsg = {
      id: Date.now().toString(),
      name: randomSample.name,
      email: randomSample.email,
      subject: randomSample.subject,
      message: randomSample.message,
      date: new Date().toISOString(),
      read: false
    };

    messages.unshift(newMsg);

    // Save local
    localStorage.setItem("portfolio_messages", JSON.stringify(messages));

    // Save server API
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg)
      });
    } catch (e) {}

    updateStats();
    renderMessages();
    showToast(`Added sample inquiry from ${newMsg.name}`);
  }

  if (btnCreateTest) btnCreateTest.addEventListener("click", addTestMessage);

  // 6. Export to CSV
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", () => {
      if (messages.length === 0) {
        showToast("No messages available to export", "fa-triangle-exclamation");
        return;
      }

      const headers = ["ID", "Sender Name", "Email", "Topic", "Date", "Status", "Message"];
      const rows = messages.map(m => [
        m.id || "",
        `"${(m.name || "").replace(/"/g, '""')}"`,
        `"${(m.email || "").replace(/"/g, '""')}"`,
        `"${(m.subject || "").replace(/"/g, '""')}"`,
        `"${(m.date || "").replace(/"/g, '""')}"`,
        m.read ? "Read" : "Unread",
        `"${(m.message || "").replace(/"/g, '""')}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Ahmed_Mabrouk_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Inquiries exported to CSV file", "fa-file-csv");
    });
  }

  // 7. Clear All Messages
  if (btnClearAll) {
    btnClearAll.addEventListener("click", async () => {
      if (messages.length === 0) return;
      if (confirm("Are you sure you want to permanently delete ALL inquiries? This action cannot be undone.")) {
        messages = [];
        localStorage.setItem("portfolio_messages", JSON.stringify([]));

        try {
          await fetch("/api/messages/all", {
            method: "DELETE",
            headers: { "x-admin-key": getAdminKey() }
          });
        } catch (e) {}

        updateStats();
        renderMessages();
        showToast("All inquiries cleared", "fa-trash-can");
      }
    });
  }

  // 8. Search & Filters Event Listeners
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.trim();
      if (clearSearchBtn) {
        if (currentSearchQuery) {
          clearSearchBtn.classList.add("show");
        } else {
          clearSearchBtn.classList.remove("show");
        }
      }
      renderMessages();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentSearchQuery = "";
      clearSearchBtn.classList.remove("show");
      renderMessages();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      currentStatusFilter = e.target.value;
      renderMessages();
    });
  }

  if (topicFilter) {
    topicFilter.addEventListener("change", (e) => {
      currentTopicFilter = e.target.value;
      renderMessages();
    });
  }

  // HTML sanitization helper
  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ==========================================================================
  // AUTHENTICATION CONTROLLER (PIN: 8080)
  // ==========================================================================
  function lockDashboard() {
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_key");
    if (authOverlay) {
      authOverlay.classList.remove("hidden");
    }
    if (passInput) {
      passInput.value = "";
      setTimeout(() => passInput.focus(), 120);
    }
    if (authErrorMsg) {
      authErrorMsg.textContent = "";
    }
  }

  function unlockDashboard() {
    sessionStorage.setItem("admin_authenticated", "true");
    sessionStorage.setItem("admin_key", ADMIN_PASS);
    if (authOverlay) {
      authOverlay.classList.add("hidden");
    }
    if (authErrorMsg) {
      authErrorMsg.textContent = "";
    }
    showToast("أهلاً بك يا أحمد! تم فتح لوحة التحكم ⚡", "fa-lock-open");
    loadMessages();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = (passInput ? passInput.value : "").trim();
      if (entered === ADMIN_PASS) {
        unlockDashboard();
      } else {
        if (authCard) {
          authCard.classList.remove("shake");
          void authCard.offsetWidth; // Force CSS repaint to re-trigger shake
          authCard.classList.add("shake");
        }
        if (authErrorMsg) {
          authErrorMsg.textContent = "كلمة المرور غير صحيحة! كلمة السر هي 8080";
        }
        if (passInput) {
          passInput.select();
        }
      }
    });
  }

  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener("click", () => {
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
      if (eyeIcon) {
        eyeIcon.className = isPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      lockDashboard();
      showToast("تم قفل لوحة التحكم بنجاح", "fa-lock");
    });
  }

  // Initial Auth Check & Screen State
  if (isAuth()) {
    if (authOverlay) authOverlay.classList.add("hidden");
    loadMessages();
  } else {
    lockDashboard();
  }

  // Auto-refresh poll every 4 seconds to catch new messages in real-time
  setInterval(() => {
    if (isAuth()) {
      loadMessages();
    }
  }, 4000);
});
