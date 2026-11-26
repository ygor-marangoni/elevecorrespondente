# Mapeamento de adaptação da referência para a Eleve

Referência preservada em `referencia-original/`. Inspeção em navegador a 1440 × 900 e revisão dos estilos responsivos e do JavaScript. Base técnica: HTML estático, `css/styles.css`, `css/icons.css`, `js/app.js`, fontes locais Inter, Geist Mono e Phosphor; sem framework ou dependência externa de execução.

| Referência | Implementação e comportamento | Decisão para Eleve |
| --- | --- | --- |
| Navegação e CTA fixo | `.site-nav`, `.purchase-dock`; `bindChromeObservers`/`updateChrome` revelam dock após o hero e o escondem no rodapé. | Reutilizar estrutura e lógica; trocar assinatura e CTA para WhatsApp, sem preço. |
| Hero | `.hero-section`, `.hero-layout`, `.hero-copy`, `.hero-orbit.hero-video-stage`, `.hero-proof-tabs`; composição centrada, animação de entrada e painel amplo. | Reutilizar grid, tipografia, painel e faixa; substituir vídeo inativo por imagem ilustrativa e fatos com fonte. Remover controles Figma sem função e efeito de digitação que fragmenta informação crítica. |
| Novidades | `.figma-news-section`, `.figma-news-grid`, quatro imagens de ferramentas; transições CSS. | Descartar conteúdo e imagens de software; o setor não apresenta quatro recursos visuais verificáveis. |
| Comparação e benefícios | `.compare-grid`, `.benefits-grid`; cartões e ilustrações Figma. | Descartar comparações não comprovadas e recursos de software. |
| Para quem | `.audience-inner` e `.audience-list`; cursores animados. | Descartar cursores de colaboração sem sentido no contexto de crédito; evitar segmentos não comprovados. |
| Galeria de alunos | `.alumni-track`, animação `marquee` com imagens duplicadas. | Descartar: não há autorização para imagens reais de clientes e o portfólio de alunos não corresponde à Eleve. |
| Conteúdo e pré-visualização sincronizada | `#conteudo`, `.content-grid`, `.module-block`, `.content-preview`, `bindSyllabus`; módulo ativo acompanha scroll/hover, visual e contador mudam. Em mobile `.learning-cards`. | Reutilizar grid, camada e mecanismo para temas efetivamente identificados; substituir ilustrações de Figma e adaptar o texto a orientação, documentos e acompanhamento. Não representar etapas como fluxo garantido. |
| Depoimentos | `.testimonials-section`; cartões flutuantes e expansão mobile. | Descartar: não há autorização para republicação nem quantidade suficiente de depoimentos validados. |
| Oferta e mentores | `.pricing-section` e `.team-section`. | Descartar preço, bônus e fotos dos mentores do workshop; vínculos atuais e fotos da equipe da Eleve não foram confirmados. |
| Fechamento e marca | `.closing-grid`, `bindClosingFigma` (partículas no canvas). | Reutilizar composição textual de fechamento; descartar logo Figma e física específica de marca sem ativo autorizado. |
| Faixa e FAQ | `.faq-marquee`, `@keyframes marquee`, `.faq-layout`, `.faq-item`; `bindFaq` gerencia `aria-expanded` e `hidden`. | Reutilizar faixa animada, layout e comportamento de FAQ com conteúdo verdadeiro e links reais. |
| Rodapé | `.footer-shell`, `.footer-main`, `.footer-content`, `.footer-endcap`; física de formas Figma. | Reutilizar composição e hierarquia; remover formas de marca alheia, manter CTA e identificação visível de demonstração independente. |

## Aplicação das skills Emil

- `emil-design-eng`: foco nos detalhes, feedback de pressão sutil, foco visível e coesão do movimento com uma empresa de crédito.
- `animate`: preservar movimento com função; usar propriedades `transform`/`opacity` quando possível, transições interrompíveis e duração curta em controles, sem biblioteca extra.
- `choreograph`: painel de conteúdo e estado ativo mudam juntos; texto financeiro permanece legível durante a mudança.
- `mobile-native`: ações acessíveis ao toque, hover condicionado à capacidade do dispositivo e nenhuma restrição de zoom.
- `review-animations`/`animation-performance`: verificar movimento reduzido, custo e controles em uso; efeito de marketing pode ser mais longo que resposta de interface.

Ressalva: `noindex` ajuda a evitar indexação, mas não oferece privacidade ou autenticação. Nenhum deploy está autorizado.

## Ajustes solicitados durante a revis?o

- A ordem segue apresenta??o, trajet?ria, solu??es e diferenciais, processo, hist?rias e presen?a local, perguntas e chamada final. Solu??es e diferenciais foram reunidos; hist?rias, equipe e presen?a local tamb?m, pois n?o h? conte?do validado suficiente para se??es independentes.
- A composi??o do processo est? em `css/legy-process.css` e `js/legy-process.js`, adaptados do projeto Legy. As quatro imagens s?o ilustra??es criadas para a demonstra??o e n?o retratam clientes ou instala??es da Eleve.
- O grid das se??es usa conte?do de at? 1600 px e margens de 24 px no desktop, conforme o grid analisado da Merco; a navega??o preserva a propor??o pr?pria da refer?ncia original.
- A faixa reaproveita a anima??o da refer?ncia, com ?cones lineares e textura da Merco. A anima??o do t?tulo alterna os termos e o ?cone; movimento reduzido mant?m o conte?do est?tico.
- O FAQ reaproveita o comportamento original, em composi??o inspirada na Merco. O bot?o principal recebeu o reflexo solicitado.

- Na revis?o do hero, removi o fundo retangular, a grade, as duas ?rbitas e as etiquetas em caixas. A rede agora usa liga??es lineares, imagens editoriais ilustrativas e numera??o dos tr?s pontos; o terceiro r?tulo tem espa?o para aparecer completo. Em telas menores, os pontos laterais se afastam do centro para n?o encostar no logotipo.
