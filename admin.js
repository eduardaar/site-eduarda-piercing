const STORAGE_KEY = "auraClinicAdminData";
const SESSION_KEY = "auraClinicSession";
const DEMO_CPF = "00000000000";
const DEMO_PASSWORD = "aura123";

const defaultData = {
  inventory: [
    { id: "labret-titanio", name: "Labret flat back", category: "Titanio", quantity: 8, minimum: 3, cost: 45, price: 110 },
    { id: "argola-clicker", name: "Argola clicker lisa", category: "Titanio", quantity: 5, minimum: 2, cost: 52, price: 120 },
    { id: "cluster-zirconia", name: "Cluster com zirconias", category: "Zirconia", quantity: 2, minimum: 2, cost: 86, price: 190 },
    { id: "ponto-ouro", name: "Ponto de luz dourado", category: "Ouro", quantity: 1, minimum: 1, cost: 160, price: 280 },
    { id: "soro-esteril", name: "Soro esteril 10ml", category: "Insumos", quantity: 18, minimum: 8, cost: 2.5, price: 0 }
  ],
  appointments: [
    {
      id: "appt-1",
      client: "Marina Costa",
      clientCpf: "123.456.789-00",
      date: "2026-06-10",
      time: "10:30",
      procedure: "Perfuração de orelha",
      area: "Conch",
      stockItem: "argola-clicker",
      stockName: "Argola clicker lisa",
      quantity: 1,
      status: "Confirmado",
      followUp: "2026-07-10",
      clinical: { consent: true, allergy: false, medication: false, diabetes: false, pregnancy: false, keloid: false, infection: false, aftercare: true },
      notes: "Anatomia favoravel. Orientar limpeza e evitar pressao lateral."
    }
  ]
};

const state = loadData();

function normalizeCpf(value) {
  return String(value || "").replace(/\D/g, "");
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultData);

  try {
    return JSON.parse(saved);
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setMessage(element, text, type) {
  element.textContent = text;
  element.classList.toggle("is-error", type === "error");
  element.classList.toggle("is-success", type === "success");
}

function showDashboard() {
  document.querySelector("[data-login-view]").classList.add("is-hidden");
  document.querySelector("[data-dashboard-view]").classList.remove("is-hidden");
  renderAll();
}

function showLogin() {
  document.querySelector("[data-dashboard-view]").classList.add("is-hidden");
  document.querySelector("[data-login-view]").classList.remove("is-hidden");
}

function inventoryItemById(id) {
  return state.inventory.find((item) => item.id === id);
}

function riskLabels(clinical) {
  const labels = [];
  if (clinical.allergy) labels.push("alergia");
  if (clinical.medication) labels.push("medicamento");
  if (clinical.diabetes) labels.push("diabetes");
  if (clinical.pregnancy) labels.push("gestante/lactante");
  if (clinical.keloid) labels.push("queloide");
  if (clinical.infection) labels.push("irritacao local");
  if (!clinical.consent) labels.push("sem termo");
  if (!clinical.aftercare) labels.push("sem orientacao registrada");
  return labels;
}

function renderMetrics() {
  const today = new Date().toISOString().slice(0, 10);
  const futureAppointments = state.appointments.filter((item) => item.date >= today).length;
  const clinicalRisks = state.appointments.filter((item) => riskLabels(item.clinical).length > 0).length;
  const lowStock = state.inventory.filter((item) => item.quantity <= item.minimum).length;
  const revenue = state.appointments.reduce((total, item) => {
    const stock = inventoryItemById(item.stockItem);
    return total + (stock ? stock.price * Number(item.quantity || 1) : 0);
  }, 0);

  document.querySelector("[data-metrics]").innerHTML = [
    ["Agendamentos futuros", futureAppointments],
    ["Alertas clinicos", clinicalRisks],
    ["Itens em ponto critico", lowStock],
    ["Receita potencial", money(revenue)]
  ]
    .map(
      ([label, value]) => `
        <article class="metric-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");
}

function renderStockSelect() {
  const select = document.querySelector("[data-stock-select]");
  select.innerHTML = state.inventory
    .map((item) => {
      const disabled = item.quantity <= 0 ? "disabled" : "";
      return `<option value="${item.id}" ${disabled}>${item.name} - ${item.quantity} un.</option>`;
    })
    .join("");
}

function renderAppointments() {
  const list = document.querySelector("[data-appointment-list]");
  const sorted = [...state.appointments].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  if (!sorted.length) {
    list.innerHTML = `<p class="login-hint">Nenhum atendimento cadastrado ainda.</p>`;
    return;
  }

  list.innerHTML = sorted
    .map((item) => {
      const risks = riskLabels(item.clinical);
      return `
        <article class="appointment-card">
          <header>
            <div>
              <h3>${item.client}</h3>
              <p>${item.date} as ${item.time} - ${item.status}</p>
            </div>
            ${risks.length ? `<span class="risk-pill">${risks.length} alerta(s)</span>` : `<span class="status-pill">ok</span>`}
          </header>
          <p><strong>Procedimento:</strong> ${item.procedure} em ${item.area}</p>
          <p><strong>Joia/insumo:</strong> ${item.stockName} (${item.quantity} un.)</p>
          <p><strong>Retorno:</strong> ${item.followUp || "Nao informado"}</p>
          <p><strong>Clinico:</strong> ${risks.length ? risks.join(", ") : "sem riscos destacados"}</p>
          <p><strong>Notas:</strong> ${item.notes || "Sem observacoes"}</p>
          <div class="appointment-actions">
            <button class="mini-btn" type="button" data-complete="${item.id}">Marcar concluido</button>
            <button class="mini-btn danger" type="button" data-delete-appointment="${item.id}">Excluir</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderInventory() {
  const table = document.querySelector("[data-inventory-table]");
  table.innerHTML = state.inventory
    .map((item) => {
      const lowClass = item.quantity <= item.minimum ? " low-stock" : "";
      return `
        <div class="inventory-row${lowClass}">
          <strong>${item.name}</strong>
          <span>${item.category}</span>
          <span>${item.quantity} un.</span>
          <span>min. ${item.minimum}</span>
          <div class="stock-controls">
            <button class="mini-btn" type="button" data-stock-add="${item.id}">+</button>
            <button class="mini-btn" type="button" data-stock-remove="${item.id}">-</button>
            <button class="mini-btn danger" type="button" data-stock-delete="${item.id}">Excluir</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderStrategy() {
  const lowStock = state.inventory.filter((item) => item.quantity <= item.minimum);
  const mostUsed = state.appointments.reduce((acc, item) => {
    acc[item.stockName] = (acc[item.stockName] || 0) + Number(item.quantity || 1);
    return acc;
  }, {});
  const topItem = Object.entries(mostUsed).sort((a, b) => b[1] - a[1])[0];
  const followUps = state.appointments.filter((item) => item.followUp).length;

  const cards = [
    {
      title: "Reposicao prioritaria",
      text: lowStock.length ? `Repor: ${lowStock.map((item) => item.name).join(", ")}.` : "Estoque acima do minimo definido."
    },
    {
      title: "Produto mais vinculado",
      text: topItem ? `${topItem[0]} apareceu em ${topItem[1]} atendimento(s).` : "Sem historico suficiente."
    },
    {
      title: "Acompanhamento",
      text: `${followUps} atendimento(s) com retorno previsto. Use isso para fortalecer pos-perfuracao.`
    }
  ];

  document.querySelector("[data-strategy]").innerHTML = cards
    .map(
      (card) => `
        <article class="strategy-card">
          <h3>${card.title}</h3>
          <p>${card.text}</p>
        </article>
      `
    )
    .join("");
}

function renderAll() {
  renderMetrics();
  renderStockSelect();
  renderAppointments();
  renderInventory();
  renderStrategy();
}

function setupLogin() {
  const form = document.querySelector("[data-login-form]");
  const message = document.querySelector("[data-login-message]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const cpf = normalizeCpf(data.get("cpf"));
    const password = data.get("password");

    if (cpf === DEMO_CPF && password === DEMO_PASSWORD) {
      localStorage.setItem(SESSION_KEY, "active");
      setMessage(message, "Acesso liberado.", "success");
      showDashboard();
      return;
    }

    setMessage(message, "CPF ou senha invalidos.", "error");
  });

  document.querySelector("[data-logout]").addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    showLogin();
  });
}

function setupAppointmentForm() {
  const form = document.querySelector("[data-appointment-form]");
  const message = document.querySelector("[data-appointment-message]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const stockId = data.get("stockItem");
    const quantity = Number(data.get("quantity"));
    const stock = inventoryItemById(stockId);

    if (!stock || stock.quantity < quantity) {
      setMessage(message, "Estoque insuficiente para esse atendimento.", "error");
      return;
    }

    stock.quantity -= quantity;
    state.appointments.push({
      id: crypto.randomUUID(),
      client: data.get("client"),
      clientCpf: data.get("clientCpf"),
      date: data.get("date"),
      time: data.get("time"),
      procedure: data.get("procedure"),
      area: data.get("area"),
      stockItem: stockId,
      stockName: stock.name,
      quantity,
      status: data.get("status"),
      followUp: data.get("followUp"),
      clinical: {
        consent: data.has("consent"),
        allergy: data.has("allergy"),
        medication: data.has("medication"),
        diabetes: data.has("diabetes"),
        pregnancy: data.has("pregnancy"),
        keloid: data.has("keloid"),
        infection: data.has("infection"),
        aftercare: data.has("aftercare")
      },
      notes: data.get("notes")
    });

    saveData();
    form.reset();
    setMessage(message, "Atendimento salvo e estoque atualizado.", "success");
    renderAll();
  });
}

function setupStockForm() {
  document.querySelector("[data-stock-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("name");
    state.inventory.push({
      id: `${Date.now()}-${normalizeCpf(name) || name.toLowerCase().replace(/\W+/g, "-")}`,
      name,
      category: data.get("category"),
      quantity: Number(data.get("quantity")),
      minimum: Number(data.get("minimum")),
      cost: Number(data.get("cost")),
      price: Number(data.get("price"))
    });

    saveData();
    event.currentTarget.reset();
    renderAll();
  });
}

function setupTableActions() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    const addId = target.dataset.stockAdd;
    const removeId = target.dataset.stockRemove;
    const deleteStockId = target.dataset.stockDelete;
    const completeId = target.dataset.complete;
    const deleteAppointmentId = target.dataset.deleteAppointment;

    if (addId) {
      inventoryItemById(addId).quantity += 1;
    }

    if (removeId) {
      const item = inventoryItemById(removeId);
      item.quantity = Math.max(0, item.quantity - 1);
    }

    if (deleteStockId) {
      state.inventory = state.inventory.filter((item) => item.id !== deleteStockId);
    }

    if (completeId) {
      const appointment = state.appointments.find((item) => item.id === completeId);
      appointment.status = "Concluido";
    }

    if (deleteAppointmentId) {
      state.appointments = state.appointments.filter((item) => item.id !== deleteAppointmentId);
    }

    if (addId || removeId || deleteStockId || completeId || deleteAppointmentId) {
      saveData();
      renderAll();
    }
  });

  document.querySelector("[data-reset-demo]").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    Object.assign(state, loadData());
    renderAll();
  });
}

setupLogin();
setupAppointmentForm();
setupStockForm();
setupTableActions();

if (localStorage.getItem(SESSION_KEY) === "active") {
  showDashboard();
} else {
  showLogin();
}
