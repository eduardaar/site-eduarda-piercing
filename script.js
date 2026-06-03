const whatsappUrl = "https://wa.me/5577998632417";

const features = [
  ["M", "Materiais seguros", "Protocolos de higiene, esterilização e materiais adequados para perfurações."],
  ["H", "Atendimento com hora marcada", "Tempo reservado para avaliação, conversa e execução sem pressa."],
  ["C", "Orientação de cuidados", "Explicações objetivas para manter a perfuração limpa e bem acompanhada."],
  ["J", "Joias em titânio e ouro", "Curadoria de peças com acabamento refinado e materiais biocompatíveis."]
];

const services = [
  ["P", "Perfurações corporais", "Planejamento de posição, anatomia e joia inicial para uma experiência segura."],
  ["A", "Atualização de joias", "Troca assistida para renovar a composição no momento correto da cicatrização."],
  ["S", "Spa de joias", "Cuidado especial para higienizar e revitalizar peças usadas no dia a dia."],
  ["L", "Limpeza e polimento", "Manutenção para preservar brilho, encaixe e acabamento das joias."],
  ["J", "Consultoria para escolha de joia", "Apoio para combinar material, tamanho, pedra e estilo com sua anatomia."],
  ["C", "Acompanhamento de cicatrização", "Avaliações para tirar dúvidas e ajustar cuidados quando necessário."]
];

const portfolio = [
  ["Orelha", "Conch com argola", "Composição delicada com foco em equilíbrio e brilho pontual.", "CO"],
  ["Orelha", "Flat com zircônia", "Ponto de luz discreto para valorizar a parte superior da orelha.", "FL"],
  ["Nariz", "Nostril minimalista", "Joia pequena e elegante para uso diário.", "NO"],
  ["Boca", "Labret central", "Perfuração feita com planejamento de simetria e conforto.", "LA"],
  ["Umbigo", "Umbigo premium", "Joia curva com acabamento dourado e visual sofisticado.", "UM"],
  ["Outros", "Dermal decorativo", "Aplicação pontual para composições personalizadas.", "DE"]
];

const jewelry = [
  ["Titânio", "Argola clicker lisa", "Titânio ASTM F136", "R$ 120", "CL"],
  ["Ouro", "Ponto de luz dourado", "Ouro 18k", "R$ 280", "OU"],
  ["Zircônia", "Cluster com zircônias", "Titânio com zircônias", "R$ 190", "ZI"],
  ["Básicas", "Barbell reto", "Titânio polido", "R$ 90", "BR"],
  ["Premium", "Piercing ornamental", "Ouro e zircônias", "R$ 420", "PR"],
  ["Titânio", "Labret flat back", "Titânio anodizado", "R$ 110", "LB"]
];

const care = [
  "Higienize a região apenas conforme a orientação recebida no atendimento.",
  "Evite tocar, girar ou movimentar a joia sem necessidade.",
  "Não troque a joia antes do prazo indicado para sua perfuração.",
  "Evite piscina, mar, maquiagem ou produtos agressivos enquanto a região estiver sensível.",
  "Em caso de dúvida, inchaço persistente ou desconforto, procure a profissional."
];

const renderCards = () => {
  const featuresRoot = document.querySelector("[data-features]");
  featuresRoot.innerHTML = features
    .map(
      ([icon, title, text]) => `
        <article class="feature-card reveal">
          <span class="feature-icon" aria-hidden="true">${icon}</span>
          <h3>${title}</h3>
          <p>${text}</p>
        </article>
      `
    )
    .join("");

  document.querySelector("[data-services]").innerHTML = services
    .map(
      ([icon, title, text]) => `
        <article class="service-card reveal">
          <span class="service-icon" aria-hidden="true">${icon}</span>
          <h3>${title}</h3>
          <p>${text}</p>
        </article>
      `
    )
    .join("");

  document.querySelector("[data-care]").innerHTML = care
    .map(
      (item) => `
        <div class="check-item">
          <span aria-hidden="true">✓</span>
          <p>${item}</p>
        </div>
      `
    )
    .join("");
};

const createFilter = (root, labels, onChange) => {
  root.innerHTML = labels
    .map((label, index) => `<button class="filter-btn ${index === 0 ? "is-active" : ""}" type="button">${label}</button>`)
    .join("");

  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    root.querySelectorAll("button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    onChange(button.textContent);
  });
};

const renderPortfolio = (filter = "Todos") => {
  const list = filter === "Todos" ? portfolio : portfolio.filter(([category]) => category === filter);
  document.querySelector("[data-portfolio]").innerHTML = list
    .map(
      ([category, title, text, initials]) => `
        <article class="portfolio-card reveal is-visible">
          <div class="placeholder-img" role="img" aria-label="Imagem placeholder de ${title}">
            <span>${initials}</span>
          </div>
          <div class="card-body">
            <span class="card-meta">${category}</span>
            <h3>${title}</h3>
            <p>${text}</p>
          </div>
        </article>
      `
    )
    .join("");
};

const renderJewelry = (filter = "Todos") => {
  const list = filter === "Todos" ? jewelry : jewelry.filter(([category]) => category === filter);
  document.querySelector("[data-jewelry]").innerHTML = list
    .map(
      ([category, title, material, price, initials]) => `
        <article class="jewelry-card reveal is-visible">
          <div class="placeholder-img" role="img" aria-label="Imagem placeholder da joia ${title}">
            <span>${initials}</span>
          </div>
          <div class="card-body">
            <span class="card-meta">${category}</span>
            <h3>${title}</h3>
            <p>${material}</p>
            <strong class="jewelry-price">A partir de ${price}</strong>
            <a class="btn btn-secondary" href="${whatsappUrl}" target="_blank" rel="noopener">Consultar disponibilidade</a>
          </div>
        </article>
      `
    )
    .join("");
};

const setupNavigation = () => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");

  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
};

const setupReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
};

renderCards();
renderPortfolio();
renderJewelry();
createFilter(document.querySelector("[data-portfolio-filters]"), ["Todos", "Orelha", "Nariz", "Boca", "Umbigo", "Outros"], renderPortfolio);
createFilter(document.querySelector("[data-jewelry-filters]"), ["Todos", "Titânio", "Ouro", "Zircônia", "Básicas", "Premium"], renderJewelry);
setupNavigation();
setupReveal();
