/**
 * AHMED MABROUK PORTFOLIO — INTERACTIVE ENGINE
 * Handles projects modal, filtering, clipboard copy, smooth navigation, and animations.
 */

// Comprehensive Project Database directly compiled from Ahmed's two CVs
const projectsData = {
  "farmtech": {
    title: "FarmTecH — AI-Powered Agricultural Decision Support System",
    subtitle: "Graduation Flagship Project | Multi-Disciplinary AI Solution",
    category: "AI & Machine Learning / Computer Vision",
    tags: ["Machine Learning", "Deep Learning", "Deep Reinforcement Learning", "Computer Vision", "Agri-LLaVA", "GIS & H3", "Python"],
    description: "Developed an AI-powered agricultural decision support system integrating Machine Learning, Deep Learning, Reinforcement Learning, Computer Vision, and agricultural data analysis to modernize smart farming.",
    highlights: [
      "Built intelligent modules for crop recommendation, yield prediction, soil health analysis, irrigation, and fertilizer management.",
      "Implemented a Deep Reinforcement Learning component for dynamic crop rotation scheduling, integrated through a centralized decision engine.",
      "Integrated Agri-LLaVA for multimodal agricultural image analysis and natural-language plant disease diagnosis.",
      "Processed complex environmental, soil (SoilGrids), satellite-derived remote sensing datasets, and FAOSTAT agricultural metrics."
    ],
    architecture: "Centralized Decision Engine (Python) connecting ML predictive pipelines, Deep RL policy networks, and Agri-LLaVA multimodal inference via high-efficiency APIs.",
    impact: "Provides holistic decision support for farmers to optimize yield, minimize fertilizer overhead, and protect soil nutrient equilibrium over multi-season cycles."
  },
  "medical-ai": {
    title: "Medical AI Diagnostic & Knowledge Assistant",
    subtitle: "Computer Vision & Generative AI (RAG) Clinical Support",
    category: "Computer Vision / Generative AI",
    tags: ["Computer Vision", "ResNet50", "NLP", "Generative AI", "RAG", "LangChain", "FAISS", "FastAPI"],
    description: "Developed a medical AI assistant combining Computer Vision for clinical imagery analysis with Retrieval-Augmented Generation (RAG) for medical literature query answering.",
    highlights: [
      "Leveraged fine-tuned ResNet50 convolutional neural networks for accurate medical scan and anomaly classification.",
      "Engineered retrieval-augmented generation (RAG) using LangChain, FAISS vector index, and contextual embedding pipelines.",
      "Integrated generative Large Language Model (LLM) components to produce explainable natural-language diagnostic summaries.",
      "Constructed a high-performance backend with FastAPI to unify vision pipelines and knowledge retrieval endpoints."
    ],
    architecture: "FastAPI REST backend orchestrating ResNet50 vision inference and LangChain/FAISS vector retrieval for contextual medical knowledge synthesis.",
    impact: "Significantly accelerates medical literature search and offers preliminary scan evaluation with high confidence scoring."
  },
  "ecommerce-platform": {
    title: "Full E-Commerce Web Application",
    subtitle: "Enterprise-Grade React.js Storefront with Dynamic State",
    category: "Front-End & React",
    tags: ["React.js", "Redux Toolkit", "Tailwind CSS", "Framer Motion", "REST API"],
    description: "Engineered a complete, responsive e-commerce web platform featuring dynamic catalog management, multi-level filtering, cart management, and fluid animations.",
    highlights: [
      "Centralized global application state across 100+ dynamic products using Redux Toolkit.",
      "Implemented instant search, multi-faceted filtering (category, price range, ratings), and sorting.",
      "Architected component-based UI with memoization (useMemo, React.memo) to eliminate redundant re-renders.",
      "Integrated Framer Motion transitions for micro-interactions, cart sidebars, and multi-step checkout flow."
    ],
    architecture: "Component-driven React.js single-page application with Redux Toolkit store slices, custom hooks, and Tailwind CSS styling.",
    impact: "Delivers smooth 60fps animations, sub-second product filtering, and persistent cart storage across browser reloads."
  },
  "admin-dashboard": {
    title: "Admin Analytics & System Operations Dashboard",
    subtitle: "Internal Operations Console with Real-Time Charting",
    category: "Front-End & React",
    tags: ["React.js", "Chart.js", "Context API", "REST API", "Responsive UI"],
    description: "Architected a full internal dashboard system with secure authentication, paginated data tables, live analytics charts, and complete CRUD operations.",
    highlights: [
      "Integrated Chart.js to visualize live sales pipelines, revenue distribution, and user retention metrics.",
      "Built complete CRUD management panels for users, products, and order statuses with instant feedback.",
      "Optimized large-table data rendering with custom pagination and memoized components.",
      "Implemented protected route guards and session management with React Router and Context API."
    ],
    architecture: "Secure React application with Context API state container, Chart.js canvas renderers, and responsive CSS grid layout.",
    impact: "Streamlines internal back-office administration and real-time operational KPI tracking."
  },
  "real-estate": {
    title: "Real Estate Property Listings Platform",
    subtitle: "Media-Optimized Property Portal with Dark Mode",
    category: "Front-End & React",
    tags: ["React.js", "React Router", "Tailwind CSS", "Dark Mode", "REST API"],
    description: "Built a modern real estate web application featuring advanced property filtering, detailed listing pages, inquiry lead forms, and instant theme toggling.",
    highlights: [
      "Advanced multi-criteria search filtering by price, location, property type, and amenities.",
      "Seamless dark mode and light mode implementation preserving user preference across sessions.",
      "Optimized media and image rendering ensuring rapid page load times for media-heavy property galleries.",
      "Direct agent inquiry modal and validated contact forms."
    ],
    architecture: "React.js with React Router client-side routing, Tailwind dark-mode classes, and RESTful property APIs.",
    impact: "Enhanced user engagement with responsive mobile-first property viewing and inquiry submission."
  },
  "medical-test-pred": {
    title: "Medical Test Results Prediction System",
    subtitle: "Predictive ML Classification & Interactive Dashboards",
    category: "AI & Machine Learning",
    tags: ["XGBoost", "Random Forest", "Scikit-Learn", "Flask", "Dash", "Plotly"],
    description: "Developed an end-to-end machine learning system predicting medical test result classifications from patient clinical parameters.",
    highlights: [
      "Compared and rigorously benchmarked XGBoost and Random Forest classifiers with cross-validation.",
      "Built an interactive Dash/Plotly dashboard for clinicians to explore feature importances and correlation heatmaps.",
      "Deployed the selected high-accuracy model via a Flask REST API backend.",
      "Integrated ROC-AUC analysis, confusion matrices, and precision-recall trade-offs."
    ],
    architecture: "Trained Scikit-learn & XGBoost pipelines wrapped in Flask API, connected to Dash/Plotly interactive charts.",
    impact: "Empowers healthcare professionals with rapid predictive insights and transparent feature importance analytics."
  },
  "sentiment-nlp": {
    title: "E-Commerce Reviews Sentiment Analysis",
    subtitle: "Deep Learning Sequence Models & Interactive Interface",
    category: "AI & Machine Learning / NLP",
    tags: ["TensorFlow", "Keras", "LSTM", "GRU", "CNN", "RNN", "Streamlit"],
    description: "Developed an NLP sentiment classification system for customer e-commerce feedback, comparing multiple modern recurrent architectures.",
    highlights: [
      "Applied text preprocessing, tokenization, lemmatization, stopword removal, and sequence padding.",
      "Trained and evaluated CNN, RNN, LSTM, and GRU neural architectures using TensorFlow/Keras.",
      "Engineered an interactive Streamlit web application allowing live model selection and text classification.",
      "Visualized prediction confidence distributions and token attention scores."
    ],
    architecture: "Keras deep recurrent network serialized and loaded into a Streamlit reactive frontend.",
    impact: "Enables instant monitoring of customer satisfaction and sentiment trends across thousands of online reviews."
  },
  "task-board": {
    title: "Interactive Task & Project Management Platform",
    subtitle: "Trello-Style Kanban with Fluid Drag-and-Drop",
    category: "Front-End & React",
    tags: ["React.js", "react-beautiful-dnd", "Context API", "REST API"],
    description: "Developed a productivity platform with multi-board management, category filtering, and accessible drag-and-drop task movements.",
    highlights: [
      "Integrated react-beautiful-dnd for accessible, smooth reordering within and between columns.",
      "Centralized state synchronization via Context API ensuring data integrity.",
      "Dynamic column and board creation with color-coded priority tags and due dates.",
      "Optimized rendering preventing jank during rapid drag operations."
    ],
    architecture: "React.js with react-beautiful-dnd state controller and Context API synchronization layer.",
    impact: "Streamlines project task assignment, sprint planning, and agile backlog management."
  },
  "cv-studio": {
    title: "Smart Image Processing Studio",
    subtitle: "Interactive Computer Vision Sandbox with Live Tuning",
    category: "Computer Vision / AI",
    tags: ["Python", "OpenCV", "Streamlit", "NumPy", "Pillow"],
    description: "Built an interactive computer vision application implementing classical and advanced image processing techniques with real-time feedback.",
    highlights: [
      "Implemented noise generation, filtering, Gaussian blur, thresholding, and morphological operations.",
      "Integrated advanced algorithms including Hough Transform line/circle detection and Watershed segmentation.",
      "Designed an interactive Streamlit UI for comparing original and processed images side-by-side with live sliders.",
      "Engineered optimized NumPy array manipulation for instant browser rendering."
    ],
    architecture: "Python OpenCV processing engine connected to Streamlit reactive sliders and Canvas viewports.",
    impact: "Serves as an educational and prototyping tool for vision algorithms and pre-processing parameter tuning."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Update footer year dynamically
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Navigation scroll styling
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("open");
      mobileDrawer.classList.toggle("open");
    });

    // Close mobile menu when clicking a link
    mobileDrawer.querySelectorAll(".mobile-link, .btn").forEach(link => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("open");
        mobileDrawer.classList.remove("open");
      });
    });
  }

  // Resume dropdown toggle
  const cvDropdown = document.getElementById("cv-dropdown");
  const cvBtn = document.getElementById("cv-dropdown-btn");
  if (cvDropdown && cvBtn) {
    cvBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cvDropdown.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!cvDropdown.contains(e.target)) {
        cvDropdown.classList.remove("open");
      }
    });
  }

  // Projects filtering logic
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      projectCards.forEach(card => {
        const cat = card.getAttribute("data-category") || "";
        if (filter === "all" || cat.includes(filter)) {
          card.style.display = "flex";
          card.style.animation = "fadeInDown 0.3s ease";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Modal setup
  const modal = document.getElementById("project-modal");
  const modalTarget = document.getElementById("modal-content-target");
  const modalClose = document.getElementById("modal-close-btn");

  function openProjectModal(projectId) {
    const data = projectsData[projectId];
    if (!data) return;

    modalTarget.innerHTML = `
      <div class="modal-badge-row">
        <span class="bento-tag highlight">${data.category}</span>
      </div>
      <h2 class="modal-title" id="modal-project-title">${data.title}</h2>
      <p class="modal-subtitle">${data.subtitle}</p>

      <h3 class="modal-section-title">Overview</h3>
      <p class="modal-text">${data.description}</p>

      <h3 class="modal-section-title">Key Features & Engineering</h3>
      <ul class="modal-bullet-list">
        ${data.highlights.map(h => `<li><i class="fa-solid fa-circle-check"></i> <span>${h}</span></li>`).join('')}
      </ul>

      <h3 class="modal-section-title">Technical Architecture</h3>
      <p class="modal-text">${data.architecture}</p>

      <h3 class="modal-section-title">Technologies & Tools</h3>
      <div class="modal-tech-stack">
        ${data.tags.map(t => `<span class="modal-tech-pill">${t}</span>`).join('')}
      </div>

      <h3 class="modal-section-title">Impact & Outcome</h3>
      <p class="modal-text">${data.impact}</p>

      <div class="modal-actions">
        <a href="#contact" class="btn btn-primary" onclick="closeProjectModal()">
          <span>Discuss Similar Project</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    `;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeProjectModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Bind project card detail triggers
  document.querySelectorAll(".open-modal-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const projId = btn.getAttribute("data-project");
      openProjectModal(projId);
    });
  });

  // Also bind bento items with data-project-id
  document.querySelectorAll(".bento-item[data-project-id]").forEach(item => {
    item.addEventListener("click", () => {
      const projId = item.getAttribute("data-project-id");
      openProjectModal(projId);
    });
    item.style.cursor = "pointer";
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeProjectModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeProjectModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeProjectModal();
    }
  });

  // Toast Notification helper
  const toast = document.getElementById("toast");
  function showToast(message) {
    if (!toast) return;
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #bbf246;"></i> ${message}`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  // Copy-to-clipboard functionality
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const textToCopy = btn.getAttribute("data-copy");
      if (navigator.clipboard && textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied to clipboard: ${textToCopy}`);
        }).catch(() => {
          fallbackCopyText(textToCopy);
        });
      } else if (textToCopy) {
        fallbackCopyText(textToCopy);
      }
    });
  });

  function fallbackCopyText(text) {
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    showToast(`Copied: ${text}`);
  }

  // Contact Form Submission (Saves to Admin Dashboard & Disk)
  const contactForm = document.getElementById("contact-form");
  const formFeedback = document.getElementById("form-feedback");
  const formSubmitBtn = document.getElementById("form-submit-btn");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const originalText = formSubmitBtn.innerHTML;

      const nameVal = document.getElementById("contact-name").value.trim();
      const emailVal = document.getElementById("contact-email").value.trim();
      const subjectVal = document.getElementById("contact-subject").value || "General Inquiry";
      const messageVal = document.getElementById("contact-message").value.trim();

      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = `<span>Saving message...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
      if (formFeedback) formFeedback.style.display = "none";

      const messageObj = {
        id: Date.now().toString(),
        name: nameVal,
        email: emailVal,
        subject: subjectVal,
        message: messageVal,
        date: new Date().toISOString(),
        read: false
      };

      // 1. Save to browser localStorage immediately
      try {
        const stored = JSON.parse(localStorage.getItem("portfolio_messages") || "[]");
        stored.unshift(messageObj);
        localStorage.setItem("portfolio_messages", JSON.stringify(stored));
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }

      // 2. Also send to local backend server if active
      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageObj)
        });
      } catch (err) {
        // Static mode, localStorage suffices
      }

      setTimeout(() => {
        formSubmitBtn.disabled = false;
        formSubmitBtn.innerHTML = originalText;

        if (formFeedback) {
          formFeedback.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:6px; text-align: left; padding: 4px 0;">
              <span style="display:flex; align-items:center; gap:8px; font-weight:700; color:#15803d; font-size:1rem;">
                <i class="fa-solid fa-circle-check"></i> تم استلام رسالتك بنجاح!
              </span>
              <span style="font-size:0.86rem; color:#166534; line-height: 1.45;">
                تم تسجيل الرسالة وحفظها في لوحة التحكم (Admin Dashboard). يمكنك أيضاً الاطلاع عليها عبر صفحة الأدمن.
              </span>
            </div>
          `;
          formFeedback.className = "form-feedback success";
          formFeedback.style.display = "block";
        }

        contactForm.reset();
        showToast("تم حفظ الرسالة في لوحة الأدمن بنجاح!");
      }, 500);
    });
  }

  // Pill tags click filter highlight
  document.querySelectorAll(".pill-tag").forEach(tag => {
    tag.addEventListener("click", () => {
      const worksSection = document.getElementById("works");
      if (worksSection) {
        worksSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  window.closeProjectModal = closeProjectModal;
});
