(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const pages = $$('.page');
  const publicHeader = $('#public-header');
  const prototypeBar = $('#prototype-bar');
  const publicFooter = $('#public-footer');
  const publicNavigation = $('#public-navigation');
  const mobileMenuButton = $('#mobile-menu-button');
  const privateRoutes = new Set(['colaborador', 'massoterapeuta']);

  let toastTimer;
  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3600);
  }

  function getRoute() {
    if (!location.hash.startsWith('#/')) return null;
    return location.hash.slice(2).split('?')[0].replace(/\/$/, '') || 'mural';
  }

  function routeToPage() {
    let route = getRoute();
    if (!route) return;

    const legacyPortalRoute = route === 'portal' || route === 'portal-beneficios';
    if (legacyPortalRoute || route === 'login') route = route === 'login' ? 'massoterapia' : 'mural';
    if (!document.querySelector(`[data-page="${route}"]`)) route = 'mural';

    pages.forEach((page) => {
      page.hidden = page.dataset.page !== route;
    });

    const isPrivate = privateRoutes.has(route);
    publicHeader.hidden = isPrivate;
    prototypeBar.hidden = isPrivate;
    publicFooter.hidden = isPrivate;

    const activeNav = route === 'artigo' ? 'mural' : route;
    $$('[data-nav]').forEach((link) => {
      const active = link.dataset.nav === activeNav;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    publicNavigation.classList.remove('open');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    $('.selena-panel')?.classList.remove('open');
    document.body.classList.remove('no-scroll');

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  window.addEventListener('hashchange', routeToPage);
  if (!location.hash || !location.hash.startsWith('#/')) location.hash = '#/mural';
  else routeToPage();

  const dailyQuotes = [
    'Cuidar de si também é uma forma de seguir em frente com mais presença.',
    'Pequenas pausas podem abrir espaço para escolhas mais conscientes.',
    'Pedir ajuda é um gesto de cuidado, não um sinal de fraqueza.',
    'Bem-estar começa quando reconhecemos aquilo de que precisamos.',
    'Respeitar seus limites também faz parte de uma rotina saudável.',
    'Cuidado compartilhado transforma o ambiente de trabalho.',
    'Hoje, escolha um gesto possível de cuidado com você.'
  ];
  const quoteTarget = $('#daily-quote-text');
  if (quoteTarget) quoteTarget.textContent = dailyQuotes[new Date().getDay()];

  mobileMenuButton.addEventListener('click', () => {
    const open = publicNavigation.classList.toggle('open');
    mobileMenuButton.setAttribute('aria-expanded', String(open));
  });

  // Accessibility preferences are shared by every public and private view.
  const accessibilityState = { font: false, contrast: false };
  function syncAccessibilityButtons(type) {
    $$(`[data-access="${type}"]`).forEach((button) => {
      button.setAttribute('aria-pressed', String(accessibilityState[type]));
    });
  }

  $$('[data-access]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.access;
      accessibilityState[type] = !accessibilityState[type];
      document.body.classList.toggle(type === 'font' ? 'large-text' : 'high-contrast', accessibilityState[type]);
      syncAccessibilityButtons(type);
      showToast(type === 'font'
        ? (accessibilityState[type] ? 'Texto ampliado.' : 'Texto no tamanho padrão.')
        : (accessibilityState[type] ? 'Alto contraste ativado.' : 'Alto contraste desativado.'));
    });
  });

  const loginModal = $('#login-modal');
  const helpModal = $('#help-modal');
  function setModal(modal, open) {
    if (!modal) return;
    modal.hidden = !open;
    document.body.classList.toggle('no-scroll', open);
    if (open) modal.querySelector('.modal-close')?.focus();
  }
  function openLoginModal() {
    const picker = $('#demo-account-picker');
    const button = $('#google-button');
    if (picker) picker.hidden = true;
    button?.setAttribute('aria-expanded', 'false');
    setModal(loginModal, true);
  }
  function closeInfoModals() {
    setModal(loginModal, false);
    setModal(helpModal, false);
  }
  $$('[data-login-open]').forEach((button) => button.addEventListener('click', openLoginModal));
  $$('[data-login-close]').forEach((button) => button.addEventListener('click', () => setModal(loginModal, false)));
  $$('[data-help-open]').forEach((button) => button.addEventListener('click', () => {
    if (!button.dataset.helpPanel) {
      const detail = $('#help-detail');
      if (detail) detail.hidden = true;
    }
    setModal(helpModal, true);
    helpModal?.querySelector('.help-directory-modal')?.scrollTo({ top: 0, behavior: 'auto' });
  }));
  $$('[data-help-close]').forEach((button) => button.addEventListener('click', () => setModal(helpModal, false)));
  [loginModal, helpModal].forEach((modal) => modal?.addEventListener('click', (event) => {
    if (event.target === modal) setModal(modal, false);
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeInfoModals();
  });
  $$('[data-help-route]').forEach((button) => button.addEventListener('click', () => {
    const route = button.dataset.helpRoute;
    setModal(helpModal, false);
    location.hash = `#/${route}`;
  }));

  const helpDetail = $('#help-detail');
  const helpContent = {
    health: {
      title: 'Espaço Saúde',
      html: '<p>Contatos encontrados no histórico de junho de 2025. Confirme a vigência com RH antes do uso oficial:</p><ul><li>São Paulo: <a href="tel:+5511971895200">(11) 97189-5200</a></li><li>Londrina: <a href="tel:+5543988738885">(43) 98873-8885</a></li><li>E-mail: <a href="mailto:espacosaude@atos.net">espacosaude@atos.net</a></li></ul><p>Para emergências, use os canais públicos indicados em “Ajuda urgente”.</p>'
    },
    mental: {
      title: 'Apoio psicológico e saúde mental',
      html: '<p>O portal reúne acolhimento do Espaço Saúde, benefícios psicológicos elegíveis e conteúdos de prevenção. Também direciona dúvidas sobre riscos psicossociais relacionados ao trabalho e NR‑1.</p><p><strong>Privacidade:</strong> informações clínicas não devem aparecer no mural nem ser compartilhadas com gestores.</p>'
    },
    nr1: {
      title: 'NR‑1 e riscos psicossociais',
      html: '<p>Fatores como sobrecarga, assédio, falta de autonomia, apoio insuficiente e isolamento no trabalho remoto devem ser tratados a partir das condições e da organização do trabalho.</p><p>No portal oficial, este caminho será conectado a SST, RH e CIPA, com canal protegido para participação dos trabalhadores e sem exposição individual no mural.</p>'
    },
    women: {
      title: 'Saúde, equidade e proteção das mulheres',
      html: '<p>Reúne orientação sobre saúde da mulher, prevenção, maternidade, climatério, equidade e enfrentamento à violência.</p><p>Em situação de violência, o Ligue 180 oferece orientação; se houver risco imediato, acione o 190.</p>'
    },
    inclusion: {
      title: 'Respeito, diversidade e inclusão',
      html: '<p>Direcionamento para situações de racismo, capacitismo, LGBTfobia, intolerância religiosa, barreiras de acessibilidade e outras formas de discriminação.</p><p>Demandas de adaptação podem seguir para RH e SST; relatos de conduta devem utilizar o canal de ética oficial.</p>'
    },
    ethics: {
      title: 'Ética, respeito e denúncia',
      html: '<p>Use o canal corporativo oficial para relatar assédio, racismo, capacitismo, LGBTfobia, violência ou outra conduta inadequada. O endereço e as regras de anonimato ainda precisam ser integrados e validados pela empresa.</p><p>Em risco imediato, acione a emergência; não aguarde retorno por e-mail.</p>'
    },
    work: {
      title: 'RH, SST e CIPA',
      html: '<p>Este caminho será conectado aos contatos oficiais de Recursos Humanos, Saúde e Segurança do Trabalho e CIPA conforme unidade e tema.</p><p>Também poderá receber solicitações de acessibilidade e adaptação razoável, sem expor diagnóstico no mural.</p>'
    },
    urgent: {
      title: 'Ajuda urgente',
      html: '<p><strong>Se houver risco imediato, não espere uma resposta corporativa:</strong></p><ul><li>Emergência médica — <a href="tel:192">SAMU 192</a></li><li>Risco ou violência em andamento — <a href="tel:190">Polícia Militar 190</a></li><li>Apoio emocional e prevenção do suicídio — <a href="tel:188">CVV 188</a>, gratuito, 24 horas</li><li>Violência contra a mulher — <a href="tel:180">Ligue 180</a></li></ul><p>Estes são canais públicos nacionais. O portal não substitui atendimento médico ou de emergência.</p>'
    }
  };

  $$('[data-help-panel]').forEach((button) => button.addEventListener('click', () => {
    const content = helpContent[button.dataset.helpPanel];
    if (!content || !helpDetail) return;
    helpDetail.innerHTML = `<h3>${content.title}</h3>${content.html}`;
    helpDetail.hidden = false;
    helpDetail.setAttribute('tabindex', '-1');
    helpDetail.focus();
  }));

  // Community prototype: photo preview, local post, likes and comments.
  const communityForm = $('#community-form');
  const communityPhoto = $('#community-photo');
  const communityPhotoPreview = $('#community-photo-preview');
  const communityPhotoImage = $('#community-photo-image');
  let communityPhotoUrl = '';

  function clearCommunityPhoto() {
    if (communityPhotoUrl) URL.revokeObjectURL(communityPhotoUrl);
    communityPhotoUrl = '';
    if (communityPhoto) communityPhoto.value = '';
    if (communityPhotoImage) communityPhotoImage.removeAttribute('src');
    if (communityPhotoPreview) communityPhotoPreview.hidden = true;
  }

  communityPhoto?.addEventListener('change', () => {
    const file = communityPhoto.files?.[0];
    if (!file) return clearCommunityPhoto();
    if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) {
      clearCommunityPhoto();
      showToast('Escolha uma imagem de até 8 MB.');
      return;
    }
    clearCommunityPhoto();
    communityPhotoUrl = URL.createObjectURL(file);
    communityPhotoImage.src = communityPhotoUrl;
    communityPhotoPreview.hidden = false;
  });
  $('#remove-community-photo')?.addEventListener('click', clearCommunityPhoto);

  function bindSocialPost(post) {
    const likeButton = $('[data-like]', post);
    const commentButton = $('[data-comment-toggle]', post);
    const commentForm = $('.inline-comment', post);
    likeButton?.addEventListener('click', () => {
      const count = $('b', likeButton);
      const liked = likeButton.classList.toggle('liked');
      likeButton.setAttribute('aria-pressed', String(liked));
      $('span', likeButton).textContent = liked ? '♥' : '♡';
      count.textContent = String(Math.max(0, Number(count.textContent) + (liked ? 1 : -1)));
    });
    commentButton?.addEventListener('click', () => {
      if (!commentForm) return;
      commentForm.hidden = !commentForm.hidden;
      if (!commentForm.hidden) $('input', commentForm)?.focus();
    });
    commentForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('input', commentForm);
      if (!input?.value.trim()) return;
      const preview = document.createElement('div');
      preview.className = 'post-comment-preview';
      const author = document.createElement('strong');
      author.textContent = 'Alicia Faria';
      const paragraph = document.createElement('p');
      paragraph.textContent = input.value.trim();
      preview.append(author, paragraph);
      post.insertBefore(preview, $('.social-actions', post));
      const count = $('b', commentButton);
      count.textContent = String(Number(count.textContent) + 1);
      input.value = '';
      commentForm.hidden = true;
      showToast('Comentário registrado nesta demonstração.');
    });
  }

  $$('.social-post').forEach(bindSocialPost);
  communityForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const textValue = $('#community-text').value.trim();
    if (!textValue && !communityPhotoUrl) {
      showToast('Escreva uma mensagem ou adicione uma foto.');
      return;
    }
    const post = document.createElement('article');
    post.className = 'social-post';
    const header = document.createElement('header');
    const avatar = document.createElement('span');
    avatar.className = 'social-avatar';
    avatar.textContent = 'AF';
    const identity = document.createElement('div');
    const author = document.createElement('strong');
    author.textContent = 'Alicia Faria';
    const meta = document.createElement('small');
    meta.textContent = `Agora · ${$('#community-category').value}`;
    identity.append(author, meta);
    header.append(avatar, identity);
    post.appendChild(header);
    if (textValue) {
      const paragraph = document.createElement('p');
      paragraph.textContent = textValue;
      post.appendChild(paragraph);
    }
    if (communityPhotoUrl) {
      const image = document.createElement('img');
      image.src = communityPhotoUrl;
      image.alt = 'Foto adicionada à publicação';
      post.appendChild(image);
      communityPhotoUrl = '';
      communityPhoto.value = '';
      communityPhotoPreview.hidden = true;
    }
    const actions = document.createElement('div');
    actions.className = 'social-actions';
    actions.innerHTML = '<button type="button" data-like aria-pressed="false"><span>♡</span> Curtir <b>0</b></button><button type="button" data-comment-toggle>Comentar <b>0</b></button>';
    const comment = document.createElement('form');
    comment.className = 'inline-comment';
    comment.hidden = true;
    comment.innerHTML = '<label class="sr-only">Escreva um comentário</label><input type="text" maxlength="200" placeholder="Escreva um comentário"><button type="submit">Enviar</button>';
    post.append(actions, comment);
    $('#community-feed').prepend(post);
    bindSocialPost(post);
    communityForm.reset();
    $('#community-text').focus();
    showToast('Publicação adicionada ao protótipo.');
  });

  $$('[data-campaign-filter]').forEach((button) => button.addEventListener('click', () => {
    const category = button.dataset.campaignFilter;
    $$('[data-campaign-filter]').forEach((filter) => filter.classList.toggle('active', filter === button));
    $$('#campaign-archive-grid [data-campaign-category]').forEach((card) => {
      card.hidden = category !== 'all' && card.dataset.campaignCategory !== category;
    });
  }));

  const articleLike = $('#article-like');
  articleLike?.addEventListener('click', () => {
    const liked = articleLike.classList.toggle('liked');
    const count = $('b', articleLike);
    articleLike.setAttribute('aria-pressed', String(liked));
    $('span', articleLike).textContent = liked ? '♥' : '♡';
    count.textContent = String(Number(count.textContent) + (liked ? 1 : -1));
  });

  $('#article-comment-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('#article-comment');
    const value = input.value.trim();
    if (!value) {
      showToast('Escreva um comentário antes de enviar.');
      return;
    }
    const comment = document.createElement('article');
    const avatar = document.createElement('span');
    avatar.className = 'social-avatar';
    avatar.textContent = 'AF';
    const content = document.createElement('div');
    const author = document.createElement('strong');
    author.textContent = 'Alicia Faria';
    const meta = document.createElement('small');
    meta.textContent = 'Agora';
    const paragraph = document.createElement('p');
    paragraph.textContent = value;
    content.append(author, meta, paragraph);
    comment.append(avatar, content);
    $('#article-comment-list').appendChild(comment);
    input.value = '';
    showToast('Comentário adicionado nesta demonstração.');
  });

  const languageMenu = $('#language-menu');
  $$('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => {
    if (!languageMenu || button.closest('.mobile-utility-row')) {
      showToast('Idioma: português (Brasil). Outras traduções serão adicionadas na próxima versão.');
      return;
    }
    languageMenu.hidden = !languageMenu.hidden;
    button.setAttribute('aria-expanded', String(!languageMenu.hidden));
  }));
  $$('[data-language]').forEach((button) => button.addEventListener('click', () => {
    const language = button.dataset.language;
    if (language === 'pt-BR') showToast('Português (Brasil) selecionado.');
    else if (language === 'en') showToast('English estará disponível na evolução do portal.');
    else showToast('Español estará disponível na evolução do portal.');
    $$('[data-language]').forEach((option) => option.setAttribute('aria-current', String(option === button)));
    if (languageMenu) languageMenu.hidden = true;
  }));

  const teamMore = $('#team-more');
  teamMore?.addEventListener('click', () => {
    const extra = $('#additional-team');
    if (!extra) return;
    extra.hidden = !extra.hidden;
    teamMore.setAttribute('aria-expanded', String(!extra.hidden));
    teamMore.textContent = extra.hidden ? 'Ver toda a equipe +' : 'Ocultar equipe −';
  });

  // Buttons that represent future integrations stay demonstrable without sending real data.
  $$('[data-demo-action]').forEach((button) => {
    button.addEventListener('click', () => showToast(button.dataset.demoAction));
  });

  // Simulated Google sign-in: the account carries the role; the user never chooses a role manually.
  const googleButton = $('#google-button');
  const accountPicker = $('#demo-account-picker');
  googleButton.addEventListener('click', () => {
    accountPicker.hidden = false;
    googleButton.setAttribute('aria-expanded', 'true');
    accountPicker.querySelector('button')?.focus();
  });

  $$('[data-demo-account]').forEach((account) => {
    account.addEventListener('click', () => {
      const role = account.dataset.demoAccount;
      showToast(role === 'colaborador'
        ? 'Conta reconhecida como colaboradora. Abrindo o agendamento…'
        : 'Conta reconhecida como massoterapeuta. Abrindo a agenda profissional…');
      setTimeout(() => { location.hash = `#/${role}`; }, 450);
    });
  });

  // Collaborator booking demo.
  const professionals = {
    regina: {
      name: 'Regina', initial: 'R', avatarClass: 'purple', location: 'São Paulo',
      details: 'São Paulo · período da manhã · sessões de 20 minutos',
      availability: {
        '2026-09-28': ['08h30', '09h10', '10h30'],
        '2026-09-30': ['08h10', '09h30', '10h10'],
        '2026-10-02': ['08h30', '09h50', '10h30'],
        '2026-10-05': ['08h10', '09h10', '10h50'],
        '2026-10-07': ['08h30', '09h30'],
        '2026-10-09': ['08h10', '10h10']
      }
    },
    silvana: {
      name: 'Silvana', initial: 'S', avatarClass: 'pink', location: 'São Paulo',
      details: 'São Paulo · período da tarde · sessões de 20 minutos',
      availability: {
        '2026-09-28': ['13h30', '14h10', '15h30'],
        '2026-09-29': ['13h50', '14h50', '16h10'],
        '2026-10-01': ['13h30', '15h10', '16h30'],
        '2026-10-05': ['14h10', '15h30'],
        '2026-10-06': ['13h50', '15h10', '16h10'],
        '2026-10-08': ['13h30', '14h50', '16h30']
      }
    },
    claudio: {
      name: 'Cláudio', initial: 'C', avatarClass: 'green', location: 'Londrina',
      details: 'Londrina · manhã e tarde · sessões de 20 minutos',
      availability: {
        '2026-09-28': ['09h00', '10h20', '14h00'],
        '2026-09-30': ['09h40', '11h00', '15h20'],
        '2026-10-02': ['08h40', '10h00', '14h40'],
        '2026-10-05': ['09h00', '13h40', '15h00'],
        '2026-10-07': ['10h20', '14h00'],
        '2026-10-09': ['09h40', '13h20', '15h20']
      }
    }
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  let selectedProfessionalKey = null;
  let visibleMonth = new Date(2026, 8, 1);
  let selectedDateKey = null;
  let selectedTime = null;

  function dateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function parseDateKey(key) {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function formatLongDate(key) {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseDateKey(key));
  }

  function resetSlotSelection() {
    selectedDateKey = null;
    selectedTime = null;
    $('#selected-date-title').textContent = 'Selecione um dia';
    $('#times-instruction').textContent = 'Dias destacados possuem horários disponíveis.';
    $('#time-slots').innerHTML = '<div class="empty-times">◷<span>Escolha um dia disponível no calendário.</span></div>';
    $('#booking-summary').hidden = true;
  }

  function renderCalendar() {
    const grid = $('#month-grid');
    const professional = professionals[selectedProfessionalKey];
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    $('#month-title').textContent = `${monthNames[month]} de ${year}`;
    grid.innerHTML = '';

    for (let index = 0; index < firstDay; index += 1) {
      const spacer = document.createElement('span');
      spacer.className = 'calendar-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      grid.appendChild(spacer);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = dateKey(year, month, day);
      const available = Boolean(professional?.availability[key]);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `calendar-day${available ? ' available' : ''}${selectedDateKey === key ? ' selected' : ''}`;
      button.textContent = day;
      button.disabled = !available;
      button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', available ? `${formatLongDate(key)}, com horários disponíveis` : `${day}, indisponível`);
      if (selectedDateKey === key) button.setAttribute('aria-selected', 'true');
      if (available) button.addEventListener('click', () => selectDate(key));
      grid.appendChild(button);
    }
  }

  function selectDate(key) {
    selectedDateKey = key;
    selectedTime = null;
    renderCalendar();
    $('#selected-date-title').textContent = formatLongDate(key);
    $('#times-instruction').textContent = 'Escolha um dos horários abaixo.';
    $('#booking-summary').hidden = true;
    const slots = professionals[selectedProfessionalKey].availability[key];
    const container = $('#time-slots');
    container.innerHTML = '';
    slots.forEach((time) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'time-button';
      button.textContent = time;
      button.addEventListener('click', () => {
        selectedTime = time;
        $$('.time-button', container).forEach((slot) => slot.classList.toggle('selected', slot === button));
        $$('.time-button', container).forEach((slot) => slot.setAttribute('aria-pressed', String(slot === button)));
        $('#selected-slot-summary').textContent = `${formatLongDate(key)}, às ${time}`;
        $('#booking-summary').hidden = false;
      });
      container.appendChild(button);
    });
    container.querySelector('button')?.focus();
  }

  function selectProfessional(key) {
    selectedProfessionalKey = key;
    const professional = professionals[key];
    $$('.professional-card').forEach((card) => {
      const active = card.dataset.professional === key;
      card.classList.toggle('selected', active);
      card.setAttribute('aria-pressed', String(active));
    });
    const avatar = $('#selected-avatar');
    avatar.textContent = professional.initial;
    avatar.className = `person-avatar ${professional.avatarClass}`;
    $('#selected-name').textContent = professional.name;
    $('#selected-details').textContent = professional.details;
    visibleMonth = new Date(2026, 8, 1);
    resetSlotSelection();
    renderCalendar();
    $('#calendar-section').hidden = false;
    $('#calendar-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $$('.professional-card').forEach((card) => card.addEventListener('click', () => selectProfessional(card.dataset.professional)));
  $('#change-professional').addEventListener('click', () => {
    $('#calendar-section').hidden = true;
    selectedProfessionalKey = null;
    $$('.professional-card').forEach((card) => {
      card.classList.remove('selected');
      card.setAttribute('aria-pressed', 'false');
    });
    $('#choose-title').scrollIntoView({ behavior: 'smooth' });
  });
  $('#previous-month').addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    resetSlotSelection();
    renderCalendar();
  });
  $('#next-month').addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    resetSlotSelection();
    renderCalendar();
  });

  function speak(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      showToast('A leitura por voz não está disponível neste navegador.');
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.96;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
  }

  $('#read-calendar').addEventListener('click', () => {
    if (!selectedProfessionalKey) return;
    const professional = professionals[selectedProfessionalKey];
    const firstDates = Object.entries(professional.availability).slice(0, 3)
      .map(([key, times]) => `${formatLongDate(key)}, às ${times.join(', ')}`)
      .join('. ');
    speak(`Agenda de ${professional.name}. Os primeiros horários disponíveis são: ${firstDates}.`);
  });

  const modal = $('#confirmation-modal');
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
    $('#review-state').hidden = false;
    $('#success-state').hidden = true;
  }

  $('#review-booking').addEventListener('click', () => {
    if (!selectedProfessionalKey || !selectedDateKey || !selectedTime) return;
    const professional = professionals[selectedProfessionalKey];
    $('#modal-professional').textContent = professional.name;
    $('#modal-location').textContent = professional.location;
    $('#modal-date-time').textContent = `${formatLongDate(selectedDateKey)}, às ${selectedTime}`;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    $('#modal-close').focus();
  });
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-back').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  $('#confirm-booking').addEventListener('click', () => {
    const professional = professionals[selectedProfessionalKey];
    $('#review-state').hidden = true;
    $('#success-state').hidden = false;
    $('#success-message').textContent = `Seu horário com ${professional.name}, em ${formatLongDate(selectedDateKey)}, às ${selectedTime}, foi reservado.`;
    $('#finish-booking').focus();
  });
  $('#finish-booking').addEventListener('click', () => {
    closeModal();
    showToast('Agendamento concluído e lembretes programados.');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });

  // Professional workspace.
  $('#confirm-arrival').addEventListener('click', (event) => {
    $('#arrival-state').innerHTML = '<span>Chegada</span><strong>Confirmada</strong>';
    event.currentTarget.textContent = 'Chegada confirmada';
    event.currentTarget.disabled = true;
    showToast('Chegada de João confirmada.');
  });
  $('#start-session').addEventListener('click', (event) => {
    event.currentTarget.textContent = 'Atendimento em andamento';
    event.currentTarget.disabled = true;
    showToast('Atendimento iniciado às 10h30.');
  });
  $('#read-client').addEventListener('click', () => speak('Próximo atendimento às dez e trinta. João Burgos. Massagem rápida de vinte minutos, na Sala Bem-estar. A chegada ainda não foi confirmada.'));
  $('#read-day').addEventListener('click', () => speak('Você tem seis atendimentos agendados hoje e uma vaga livre. Dois atendimentos foram concluídos. O próximo é João, às dez e trinta. Às onze horas, Geovana está confirmada. Às onze e trinta há um horário livre.'));
  $('#register-no-show').addEventListener('click', (event) => {
    const confirmed = window.confirm('Confirmar que João Burgos não compareceu ao atendimento das 10h30? Esta ação ficará registrada no histórico do serviço.');
    if (!confirmed) return;
    const arrival = $('#arrival-state');
    $('strong', arrival).textContent = 'Não compareceu';
    arrival.classList.add('no-show');
    $('#next-schedule-item').classList.remove('next');
    $('#next-schedule-item').classList.add('no-show');
    $('#next-schedule-description').textContent = 'Ausência registrada';
    $('#next-schedule-status').textContent = 'Faltou';
    $('#confirm-arrival').disabled = true;
    $('#start-session').disabled = true;
    event.currentTarget.disabled = true;
    showToast('Não comparecimento registrado. A operação poderá oferecer o horário para encaixe.');
  });

  // SELENA accessible assistant demo.
  const selenaPanel = $('#selena-panel');
  const selenaStatus = $('#selena-status');
  const selenaConversation = $('#selena-conversation');
  const wakeButton = $('#wake-button');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let recognitionEnabled = false;
  let conversationActive = false;
  let assistantSpeaking = false;

  function updateSelenaStatus(text, listening = false) {
    $('span', selenaStatus).textContent = text;
    selenaStatus.classList.toggle('listening', listening);
    wakeButton.classList.toggle('active', listening);
  }

  function appendMessage(author, text) {
    const message = document.createElement('div');
    const isSelena = author === 'SELENA';
    message.className = `message ${isSelena ? 'selena-message' : 'user-message'}`;
    const label = document.createElement('span');
    label.textContent = author;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    message.append(label, paragraph);
    selenaConversation.appendChild(message);
    selenaConversation.scrollTop = selenaConversation.scrollHeight;
  }

  function normalizeText(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function responseFor(command) {
    const text = normalizeText(command);
    if (text.includes('clima') || text.includes('tempo')) {
      return 'Em São Paulo, a demonstração mostra vinte e dois graus e céu parcialmente nublado. Os dados reais serão conectados a uma fonte autorizada na evolução do projeto.';
    }
    if (text.includes('agenda') || text.includes('hoje') || text.includes('rotina')) {
      return 'Hoje você tem seis atendimentos e uma vaga livre. Dois atendimentos já foram concluídos. O próximo é João, às dez e trinta.';
    }
    if (text.includes('proximo') || text.includes('quem')) {
      return 'Seu próximo atendimento é João Burgos, às dez e trinta, na Sala Bem-estar. A chegada ainda não foi confirmada.';
    }
    if (text.includes('chegou') || text.includes('chegada') || text.includes('presenca')) {
      return 'João ainda não confirmou a chegada. Posso manter você informada nesta tela.';
    }
    if (text.includes('mudanca') || text.includes('alteracao') || text.includes('cancel')) {
      return 'Houve uma mudança: o horário das onze foi preenchido por Geovana depois de um cancelamento. Sua agenda já está atualizada.';
    }
    if (text.includes('livre') || text.includes('vaga') || text.includes('encaixe')) {
      return 'Você tem uma vaga livre às onze e trinta, disponível para encaixe.';
    }
    if (text.includes('tchau') || text.includes('encerrar') || text.includes('obrigada selena') || text.includes('obrigado selena')) {
      conversationActive = false;
      return 'Até logo, Regina. Continuarei aguardando a frase Oi, SELENA enquanto a escuta estiver ativada.';
    }
    return 'Posso ler sua agenda, informar quem é o próximo colaborador, verificar alterações, consultar horários livres ou informar o clima.';
  }

  function speakSelena(text) {
    appendMessage('SELENA', text);
    assistantSpeaking = true;
    selenaPanel.classList.add('is-speaking');
    updateSelenaStatus('SELENA está falando…', recognitionEnabled);
    try { recognition?.abort(); } catch (_) { /* browser may already have stopped */ }
    speak(text, () => {
      assistantSpeaking = false;
      selenaPanel.classList.remove('is-speaking');
      if (recognitionEnabled) {
        updateSelenaStatus(conversationActive ? 'Conversa ativa · diga “tchau” para encerrar' : 'Aguardando “Oi, SELENA”', true);
        startRecognitionSafely();
      } else updateSelenaStatus('Pronta para ajudar');
    });
  }

  function handleSelenaCommand(rawCommand, fromVoice = false) {
    const command = rawCommand.trim();
    if (!command) return;
    appendMessage('VOCÊ', command);
    const normalized = normalizeText(command);
    const hasWakeWord = normalized.includes('oi selena') || normalized.includes('ola selena');

    if (fromVoice && !conversationActive && !hasWakeWord) {
      updateSelenaStatus('Aguardando “Oi, SELENA”', true);
      return;
    }

    if (hasWakeWord && !conversationActive) {
      conversationActive = true;
      const remainder = normalized.replace(/(oi|ola) selena[, ]*/g, '').trim();
      if (remainder) speakSelena(responseFor(remainder));
      else speakSelena('Oi, Regina. Bom dia. Quer saber como está sua agenda?');
      return;
    }

    if (!fromVoice) conversationActive = true;
    speakSelena(responseFor(command));
  }

  function startRecognitionSafely() {
    if (!recognition || !recognitionEnabled || assistantSpeaking) return;
    try { recognition.start(); } catch (_) { /* already started */ }
  }

  function setupRecognition() {
    if (!Recognition) return false;
    recognition = new Recognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleSelenaCommand(transcript, true);
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        recognitionEnabled = false;
        updateSelenaStatus('Microfone não autorizado · use o campo de texto');
        showToast('Permissão de microfone não concedida. A SELENA continua disponível por texto.');
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        updateSelenaStatus('Não consegui ouvir · tente novamente', recognitionEnabled);
      }
    };
    recognition.onend = () => {
      if (recognitionEnabled && !assistantSpeaking) setTimeout(startRecognitionSafely, 250);
    };
    return true;
  }

  wakeButton.addEventListener('click', () => {
    if (!recognition && !setupRecognition()) {
      updateSelenaStatus('Comando de voz indisponível · use texto');
      showToast('Este navegador não oferece reconhecimento de voz. Use a conversa por texto.');
      $('#selena-text').focus();
      return;
    }
    recognitionEnabled = !recognitionEnabled;
    if (recognitionEnabled) {
      conversationActive = false;
      updateSelenaStatus('Aguardando “Oi, SELENA”', true);
      startRecognitionSafely();
      showToast('Escuta ativada somente nesta página. Diga “Oi, SELENA”.');
    } else {
      try { recognition.stop(); } catch (_) { /* already stopped */ }
      updateSelenaStatus('Escuta por voz desativada');
    }
  });

  $('#selena-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('#selena-text');
    const value = input.value;
    input.value = '';
    handleSelenaCommand(value, false);
  });
  $$('[data-selena-command]').forEach((button) => button.addEventListener('click', () => handleSelenaCommand(button.dataset.selenaCommand, false)));
})();
