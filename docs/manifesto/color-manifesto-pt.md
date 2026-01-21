# **Color Manifesto**

## *Um modelo estrutural para sistemas de cor em produtos digitais*

> Cor não é paleta.
> Cor não é token.
> Cor é decisão em contexto.

---

## 1. O problema real dos sistemas de cor modernos

Em produtos digitais pequenos, cores raramente são um problema estrutural. Uma paleta simples, algumas variações manuais e um pouco de bom senso costumam ser suficientes. O problema surge quando o produto cresce — não apenas em número de telas, mas em complexidade, estados, contextos e equipes envolvidas.

É nesse ponto que sistemas de cor começam a mostrar fissuras. Pequenas exceções se acumulam. Ajustes feitos “só para esse caso” passam a se repetir. O que antes era uma paleta clara se transforma em um conjunto difuso de decisões históricas, difíceis de justificar e ainda mais difíceis de manter.

Esse colapso raramente acontece por falta de talento. Designers sabem escolher cores. Sabem criar contraste. Sabem organizar hierarquia visual. O que falta não é sensibilidade estética, mas **estrutura conceitual** capaz de sustentar essas decisões ao longo do tempo.

Quando um sistema não oferece uma forma clara de expressar intenção, hierarquia e contexto, essas decisões acabam sendo codificadas de maneira implícita — em nomes, variações, exceções e convenções não documentadas. O sistema continua funcionando, mas deixa de ser compreensível.

O resultado é familiar: cores que “funcionam aqui, mas não ali”, componentes que precisam de ajustes específicos dependendo do fundo, discussões intermináveis sobre “qual tom usar”, e uma sensação constante de que a consistência visual depende mais da memória da equipe do que do próprio sistema.

O Palette Kit nasce da constatação de que esse problema não é pontual nem estético. Ele é **estrutural**. E, como todo problema estrutural, não pode ser resolvido apenas adicionando mais regras ou mais tokens.

---

## 2. Quando “token” vira um antipadrão silencioso

Tokens de cor surgiram como uma solução legítima para um problema real: centralizar valores e facilitar consistência técnica. Nesse papel, eles funcionam bem. O problema começa quando tokens passam a ser usados como **substitutos de pensamento**.

À medida que um produto cresce, novos tokens são criados para capturar nuances específicas: `primaryHover`, `dangerTextMuted`, `secondaryBackgroundActive`. Cada nome tenta descrever um caso particular. Cada novo token resolve um problema local — e cria um problema global.

O antipadrão se instala quando um único token passa a carregar múltiplas decisões ao mesmo tempo: onde a cor aparece, o que ela significa, em que estado está e quão intensa deve ser. Essas dimensões ficam colapsadas em um nome que parece descritivo, mas é conceitualmente opaco.

O efeito colateral é a explosão combinatória. Para cada nova variação de contexto, cria-se um novo token. Para cada exceção, mais um nome. O sistema cresce em volume, mas perde legibilidade. Ninguém sabe mais *por que* uma cor existe — apenas *onde* ela é usada.

O problema não é usar tokens. O problema é **pedir que tokens resolvam um problema que é conceitual**. Tokens armazenam decisões; eles não explicam decisões. Quando o modelo mental por trás do sistema é frágil, tokens apenas cristalizam essa fragilidade.

O Palette Kit não rejeita tokens como ferramenta técnica. Ele rejeita a ideia de que tokens possam ser o **modelo primário** de um sistema de cor. Antes de armazenar valores, é preciso estruturar decisões.

---

## 3. Cor não é valor — é relação

Grande parte da fragilidade dos sistemas de cor vem de uma suposição implícita: a de que cores são valores absolutos que podem ser escolhidos, armazenados e reutilizados independentemente do contexto.

Na percepção humana, isso simplesmente não é verdade.

Uma cor não é clara ou escura por si só. Ela é clara ou escura **em relação** a outra. Um tom pode parecer vibrante em um contexto e apagado em outro. Um contraste que funciona em uma tela pode falhar completamente em outra, mesmo sem nenhuma alteração nos valores numéricos.

Essa relatividade não é um detalhe técnico; é a base da percepção visual. O olho humano interpreta cores sempre em comparação com o que está ao redor. Ignorar isso leva a sistemas que parecem consistentes apenas enquanto o contexto permanece estático.

Quando um sistema trata cor como valor absoluto, ele empurra a responsabilidade da adaptação para o designer, que passa a corrigir manualmente cada nova combinação de fundo, superfície e estado. O sistema deixa de ser um apoio e passa a ser um obstáculo.

Reconhecer que cor é relação muda completamente o problema. Em vez de perguntar “qual é a cor deste elemento?”, passa a fazer mais sentido perguntar “como este elemento se relaciona visualmente com o que o cerca?”. Essa mudança de pergunta prepara o terreno para um sistema mais robusto — mas exige abandonar modelos simplistas.

---

## 4. O erro estrutural: misturar uso, significado e estado

O ponto onde muitos sistemas finalmente quebram é quando tentam responder a perguntas diferentes com a mesma ferramenta. Uso, significado, estado, intensidade e contraste são tratados como variações de um único eixo. O resultado é um vocabulário confuso e decisões difíceis de isolar.

Quando um token chamado “primaryHoverText” falha, o problema não é apenas o valor da cor. É impossível saber, olhando para o nome, **qual decisão está errada**. É a intenção? É o estado? É o contraste? É o contexto? Tudo está misturado.

Esse acoplamento torna o sistema frágil. Ajustar uma dimensão afeta todas as outras. Pequenas mudanças geram efeitos colaterais imprevisíveis. Para evitar quebrar algo, a equipe começa a adicionar exceções, e o ciclo se repete.

O Palette Kit parte de uma crítica direta a esse modelo: **dimensões conceituais diferentes precisam de eixos diferentes**. Uso não é significado. Significado não é intensidade. Intensidade não é contraste. Contraste não é estado. Cada uma dessas perguntas merece uma resposta própria.

Separar esses eixos não é um exercício acadêmico. É uma forma prática de tornar decisões legíveis, discutíveis e reversíveis. Quando algo não funciona, é possível identificar exatamente qual dimensão precisa ser ajustada — sem reescrever o sistema inteiro.

Essas quatro seções estabelecem o problema e o terreno conceitual. A partir daqui, o paper muda de natureza. Ele deixa de diagnosticar e passa a propor.

É nesse ponto que o eixo central — **onde a cor aparece** — se torna inevitável.

---

## 5. O eixo central: onde a cor aparece

Antes de discutir qual cor usar, ou mesmo o que essa cor significa, existe uma pergunta mais fundamental — e frequentemente ignorada: **onde essa cor aparece**.

Sistemas de cor tradicionais tendem a começar pela identidade cromática (“primary”, “secondary”, “brand”), como se a cor existisse de forma abstrata e pudesse depois ser aplicada a qualquer lugar da interface. Essa abordagem parte de uma suposição equivocada: a de que a função perceptual da cor é independente do seu papel espacial e semântico no layout.

Na prática, o olho humano não percebe cores isoladamente. Ele percebe **superfícies**, **símbolos**, **contornos** e **camadas**. O “onde” não é um detalhe posterior; é o que define o papel perceptual da cor desde o início.

Por isso, o Palette Kit organiza todo o sistema a partir de um eixo central chamado **uso** — isto é, o local funcional onde a cor aparece na interface.

Esse eixo não descreve intenção, estado ou intensidade. Ele descreve apenas o papel perceptual da cor no espaço visual.

O modelo mínimo assume quatro usos fundamentais:

* **Preenchimento**: superfícies que definem espaço — fundos, cartões, botões, áreas clicáveis.
* **Vocabulário visual**: símbolos que comunicam significado direto — texto, ícones, emojis.
* **Linhas**: elementos estruturais — divisores, contornos, grades.
* **Overlays**: camadas transitórias — sombras, scrims, modais, estados de foco.

Essas categorias não são arbitrárias. Elas correspondem a **classes perceptuais distintas**, com expectativas visuais diferentes. Um texto não é percebido como um fundo mais escuro. Uma linha não é percebida como um texto mais fino. Um overlay não é percebido como uma superfície sólida. Cada uso impõe restrições próprias sobre contraste, intensidade, cromaticidade e transparência.

Ignorar essa distinção leva a um erro comum: tentar resolver todos os problemas de cor ajustando apenas valores. Aumenta-se a saturação “porque não destacou”, escurece-se o fundo “porque o texto não leu”, cria-se um novo token “porque esse caso é especial”. O sistema cresce, mas a estrutura não.

Ao colocar o **uso** como eixo central, o sistema passa a responder primeiro à pergunta correta: *qual é o papel perceptual desta cor neste ponto da interface?* Só depois disso faz sentido discutir significado, intensidade ou contraste.

Esse eixo também expõe outra realidade frequentemente ignorada: **a percepção da cor depende do ambiente**.

A mesma cor, com os mesmos valores numéricos, não é percebida da mesma forma em contextos diferentes. Um fundo claro sob um esquema light não exerce o mesmo papel perceptual que esse mesmo fundo sob um esquema dark. O ambiente — entendido aqui como o conjunto de condições visuais em que a interface é exibida — altera radicalmente a leitura da cor.

Esse ambiente inclui, no mínimo:

* o esquema de luminosidade (light ou dark),
* o contexto visual do layout,
* e o próprio dispositivo onde a interface é exibida.

Não se trata apenas de preferências estéticas. Trata-se de fisiologia visual. O olho humano adapta sua sensibilidade ao contexto de luminosidade. Uma cor que “funciona” num ambiente pode falhar completamente em outro, mesmo sem qualquer alteração em seus valores.

Por isso, no Palette Kit, o “onde a cor aparece” não é apenas uma coordenada espacial, mas também **perceptual**. Um preenchimento em contexto light não é o mesmo uso perceptual que um preenchimento em contexto dark. Um texto sobre uma superfície clara exige uma resolução diferente de um texto sobre uma superfície escura. Essas diferenças não são exceções; são a regra.

Quando o uso é explicitado, o sistema deixa de tratar a cor como algo absoluto e passa a tratá-la como algo **situado**. A cor não é mais “azul”. Ela é “azul enquanto superfície”, “azul enquanto símbolo”, “azul enquanto camada”. Cada uma dessas situações demanda respostas diferentes do sistema.

Esse deslocamento de perspectiva é fundamental. Ele permite que decisões posteriores — como contraste, intensidade ou relação entre cores — sejam feitas de forma coerente, sem heurísticas ocultas ou correções manuais ad hoc.

Em vez de perguntar “qual azul usar aqui?”, o designer passa a perguntar “qual é o papel dessa cor neste ponto da interface?”. Essa pergunta é mais difícil no início, mas infinitamente mais estável no longo prazo.

Ao eleger o **uso** como eixo central, o Palette Kit estabelece uma base estrutural clara: cores não são escolhidas primeiro; **funções perceptuais são**. A cor passa a ser consequência do contexto, não o contrário.

É a partir dessa base que os demais eixos — intenção, intensidade, relação e contraste — podem operar sem se atropelar. Sem esse eixo central, qualquer sistema de cor acaba inevitavelmente escorregando para a improvisação.

Aqui, a improvisação dá lugar à estrutura.

---

## 6. Superfícies não falam, símbolos falam

Um dos erros mais recorrentes em sistemas de cor é tratar todas as aplicações visuais como variações de uma mesma coisa. Texto vira “um fundo mais escuro”. Ícones viram “texto sem letras”. Bordas viram “linhas mais finas de fundo”. Essa visão simplificadora ignora uma distinção fundamental da percepção visual: **nem tudo na interface comunica da mesma forma**.

Superfícies e símbolos cumprem papéis perceptuais radicalmente diferentes.

Superfícies — fundos, cartões, botões, painéis — **não falam**. Elas não comunicam significado direto. O papel de uma superfície é criar espaço, estabelecer hierarquia espacial, separar áreas, sugerir interação ou repouso. Uma superfície bem resolvida raramente chama atenção para si mesma. Ela organiza o campo visual para que outras coisas possam ser lidas.

Símbolos — texto, ícones, emojis — fazem exatamente o oposto. Eles **existem para serem lidos**. Seu papel é comunicar significado de forma direta, explícita e imediata. Um texto que não é lido falhou completamente em sua função. Um ícone ambíguo não “organiza o espaço”; ele gera ruído cognitivo.

Misturar essas duas funções sob o mesmo modelo cromático é um erro estrutural. Quando um sistema tenta resolver texto e fundo com a mesma lógica, ele acaba forçando correções manuais: textos com sombras artificiais, fundos escurecidos “só um pouco mais”, cores que funcionam em um contexto e quebram em outro.

No Palette Kit, essa distinção é formalizada no próprio eixo de uso. **Preenchimento** e **vocabulário visual** não são variações do mesmo tipo; são categorias perceptuais distintas, com regras distintas.

Preenchimentos trabalham principalmente no eixo da **luminosidade**. Eles criam camadas, profundidade e hierarquia espacial. Um fundo mais claro ou mais escuro não “diz algo”; ele apenas posiciona elementos uns em relação aos outros. Saturação excessiva em superfícies costuma ser percebida como ruído, não como significado.

Vocabulário visual, por outro lado, trabalha prioritariamente com **legibilidade e contraste**. Texto e ícones precisam se destacar de forma inequívoca do que está atrás deles. Aqui, a tolerância a ambiguidades é mínima. Um símbolo que exige esforço para ser lido não está “elegante”; está mal resolvido.

Essa diferença explica por que decisões cromáticas que funcionam bem para superfícies frequentemente falham quando aplicadas a texto. Um azul agradável como fundo pode ser ilegível como texto. Um cinza elegante para um card pode ser insuficiente para um ícone. Não é uma questão de gosto; é uma consequência direta do papel perceptual.

Outro erro comum surge quando se tenta compensar essa diferença ajustando apenas valores. Aumenta-se a saturação do texto “para destacar”. Escurece-se o fundo “para ajudar a leitura”. Essas correções funcionam localmente, mas corroem a coerência global do sistema.

O Palette Kit evita esse ciclo ao assumir que **símbolos sempre existem em relação a uma superfície**, e que essa relação precisa ser explicitada. Texto não é resolvido “sozinho”. Ícones não têm cor absoluta. Eles são resolvidos *sobre* algo.

Essa constatação muda profundamente a forma de pensar contraste. Contraste deixa de ser uma propriedade intrínseca da cor e passa a ser uma **propriedade da relação** entre símbolo e superfície. Um texto claro só é claro em relação a um fundo escuro. Um ícone escuro só é escuro em relação a algo mais claro.

Ao separar superfícies de símbolos no modelo, o sistema impede um erro comum: tentar fazer com que uma única cor cumpra múltiplos papéis perceptuais simultaneamente. Uma cor pode ser excelente como superfície e péssima como texto — e isso não é uma falha do sistema, é uma informação valiosa.

Essa separação também reduz drasticamente o número de decisões que o designer precisa tomar. Em vez de decidir “qual tom exato de azul usar para texto neste card específico”, o designer decide algo muito mais simples e mais próximo de sua intenção real: *este elemento é um símbolo que precisa ser lido com alto contraste sobre esta superfície*.

O sistema então resolve o resto.

Quando superfícies são tratadas como espaço e símbolos como linguagem, o design deixa de ser uma sequência de ajustes visuais e passa a ser um sistema coerente de comunicação. O resultado não é apenas mais consistente; é mais legível, mais previsível e mais fácil de manter.

Separar essas duas categorias não é uma preferência estética. É um reconhecimento de como a percepção humana realmente funciona.

---

## 7. Intensidade não é estilo, é hierarquia

Em muitos sistemas de design, intensidade de cor é tratada como uma escolha estética. Um azul “mais forte” porque parece mais moderno. Um verde “mais suave” porque soa mais elegante. Essa leitura transforma intensidade em estilo — e, ao fazer isso, esconde sua função mais importante: **organizar hierarquia visual**.

Na percepção humana, intensidade não é neutra. Elementos mais intensos tendem a se destacar, a chamar atenção primeiro, a competir pelo foco visual. Elementos menos intensos recuam, sustentam o contexto, servem de base. Isso acontece independentemente da intenção do designer. É fisiologia visual, não opinião.

Quando um sistema não formaliza essa dimensão, a hierarquia passa a ser construída por ajustes informais: “só um pouco mais saturado”, “um tom acima”, “esse aqui precisa chamar mais atenção”. Cada decisão pode parecer razoável isoladamente, mas o conjunto rapidamente se torna inconsistente. O que era exceção vira padrão; o que era destaque vira ruído.

O Palette Kit trata intensidade como um **eixo explícito**, chamado de *level*. Esse eixo responde a uma pergunta simples, mas fundamental: *quão presente essa cor deve ser dentro do seu contexto de uso?*

Importante notar o que esse eixo **não** faz. Ele não define a identidade da cor. Não define o papel perceptual. Não define contraste. Ele define apenas a **força relativa** com que a cor se manifesta naquele uso específico.

Ao separar intensidade das demais decisões, o sistema elimina uma confusão comum: usar saturação para comunicar significado. Uma cor não deveria ser “mais vermelha” para ser mais perigosa, nem “mais verde” para ser mais correta. Significado pertence à intenção; intensidade pertence à hierarquia.

Essa separação devolve clareza ao processo de design. O designer deixa de ajustar cores “até parecer certo” e passa a tomar decisões declarativas: *este elemento precisa ter mais presença do que aquele*, *este outro deve recuar*, *este precisa ser dominante*, *este precisa ser neutro*. Essas decisões são sobre hierarquia, não sobre gosto.

Outro ponto crucial é que intensidade **não é absoluta**. Um nível de intensidade só faz sentido dentro de um uso e de um contexto. Um *level* aplicado a uma superfície não tem o mesmo efeito perceptual quando aplicado a um símbolo. Da mesma forma, um nível alto em um contexto escuro não se manifesta da mesma forma em um contexto claro. Por isso, intensidade não pode ser resolvida isoladamente; ela sempre opera em conjunto com o uso e o ambiente.

É exatamente aqui que muitos sistemas quebram. Ao tentar criar escalas universais (“primary-100”, “primary-500”, “primary-900”), assume-se implicitamente que intensidade é transferível entre contextos. Na prática, isso gera inconsistências visuais: o mesmo nível parece agressivo em um lugar e apagado em outro.

No Palette Kit, o *level* não é um valor cromático fixo, mas uma **posição relativa** dentro de um espaço perceptual. Ele indica direção e magnitude, não números absolutos. O sistema, ao resolver a cor, ajusta essa intensidade de acordo com o uso e o ambiente, preservando a intenção hierárquica original.

Essa abordagem muda profundamente a relação do designer com a cor. O trabalho deixa de ser “encontrar o tom certo” e passa a ser “definir a importância relativa”. O designer atua onde sua sensibilidade é mais valiosa: na organização da atenção, na clareza da hierarquia, na leitura do fluxo visual.

Tudo o que vem depois — ajustes finos de luminosidade, compensações perceptuais, adequação ao contexto — é responsabilidade do sistema. Não porque o designer não seja capaz de fazê-lo, mas porque fazê-lo manualmente em todos os casos é improdutivo, inconsistente e impossível de escalar.

Ao tratar intensidade como hierarquia, e não como estilo, o sistema cria uma linguagem comum entre design e implementação. *Level* deixa de ser um detalhe técnico e passa a ser uma ferramenta conceitual clara, previsível e comunicável.

Essa clareza é o que permite avançar para a próxima camada do problema: contraste. Porque, uma vez que a hierarquia está definida, a pergunta inevitável passa a ser outra: *como garantir que essa hierarquia seja legível em qualquer contexto?*

É aí que contraste deixa de ser consequência e passa a ser escolha consciente.

---

## 8. Contraste não é automático — é escolha

Em muitos sistemas de design, contraste é tratado como um efeito colateral. Ajusta-se a cor, verifica-se um número, passa-se em um critério mínimo e assume-se que o problema está resolvido. Essa lógica cria uma ilusão perigosa: a de que contraste pode ser **delegado ao sistema** sem envolvimento consciente do designer.

Na prática, contraste é uma decisão. Sempre foi.

Contraste determina o que pode ser lido, o que chama atenção primeiro, o que desaparece no fundo. Ele define não apenas legibilidade, mas também hierarquia, ritmo visual e esforço cognitivo. Tratar contraste como algo automático é abdicar de responsabilidade sobre a experiência real de quem usa a interface.

O problema começa quando sistemas prometem mais do que podem cumprir. “Texto sempre legível.” “Cores acessíveis por padrão.” Essas promessas ignoram uma verdade simples: **legibilidade depende de contexto**. Depende do ambiente, da superfície, da iluminação, do dispositivo, da acuidade visual do usuário e até do tempo de exposição.

Nenhum sistema sério pode garantir contraste adequado em todos os cenários sem fazer suposições fortes — e frequentemente invisíveis.

O Palette Kit parte de uma posição deliberadamente mais honesta: **contraste não é inferido; é declarado**.

Isso significa que o sistema não “decide por você” qual direção seguir — clarear ou escurecer, aumentar ou reduzir presença — sem que essa intenção esteja explícita. Em vez de heurísticas silenciosas, existe uma escolha consciente: *este elemento precisa de alto contraste neste contexto*.

Essa abordagem muda o papel do sistema. Ele deixa de ser um corretor automático e passa a ser um **executor rigoroso** de uma decisão humana. Dado um contexto, uma relação e uma intenção de contraste, o sistema calcula a cor de forma previsível. Se a decisão for impossível de cumprir, o sistema falha — e essa falha é informativa.

Falhar, aqui, não é um erro. É um sinal de que a combinação de decisões tomadas é incoerente com a percepção humana. Talvez a superfície seja clara demais. Talvez o nível de intensidade seja alto demais. Talvez a intenção de contraste seja irrealista naquele contexto. O sistema não tenta “dar um jeito”; ele aponta o problema.

Essa postura evita um dos vícios mais comuns em design systems: a correção silenciosa. Sistemas que ajustam contraste automaticamente costumam esconder decisões importantes. Um texto parece legível “por acaso”, até que um pequeno ajuste em outro ponto quebra tudo. O designer perde previsibilidade e confiança.

Ao exigir que contraste seja uma decisão explícita, o Palette Kit devolve clareza ao processo. O designer não precisa calcular números, mas precisa afirmar intenção. *Este texto precisa ser lido com conforto.* *Este ícone pode ser sutil.* *Este rótulo deve se destacar fortemente.* Essas são decisões de design legítimas, que não deveriam ser tomadas implicitamente.

Outro aspecto importante é que contraste **não é binário**. Não existe apenas “legível” e “ilegível”. Existe leitura confortável, leitura possível, leitura rápida, leitura prolongada. Sistemas que operam apenas com mínimos normativos ignoram essa gradação perceptual.

Por isso, o Palette Kit não trata contraste como um threshold mágico, mas como um **alvo** dentro de um espaço perceptual. O sistema tenta atingir esse alvo de forma consistente, respeitando o uso, a relação entre cores e o ambiente. Quando isso não é possível, a impossibilidade é comunicada.

Essa visão também ajuda a contextualizar normas como WCAG e métricas como APCA. Elas são ferramentas importantes, mas não são oráculos. Elas descrevem limites e probabilidades, não garantias universais. Usá-las sem compreender seus pressupostos é tão problemático quanto ignorá-las completamente.

Ao posicionar contraste como escolha, o sistema cria um equilíbrio saudável entre responsabilidade humana e rigor técnico. O designer decide *o que* precisa acontecer. O sistema decide *como* isso pode acontecer de forma perceptualmente coerente.

Essa separação é fundamental para evitar dois extremos igualmente problemáticos: o design puramente intuitivo, onde tudo é ajustado “no olho”, e o design puramente normativo, onde números substituem julgamento.

Contraste, afinal, é onde intenção encontra percepção. Automatizá-lo completamente é perder nuance. Ignorá-lo é perder legibilidade. Tratá-lo como escolha consciente é aceitar a complexidade do problema — e lidar com ela de forma madura.

É a partir dessa maturidade que faz sentido aprofundar o modelo perceptual por trás do sistema. Porque, para que escolhas de contraste sejam executadas de forma previsível, é preciso trabalhar em um espaço onde mudanças numéricas correspondam, de fato, a mudanças percebidas.

É nesse ponto que o espaço perceptual deixa de ser um detalhe técnico e passa a ser a base de todo o sistema.

---

## 9. OKLCH: por que espaço perceptual muda tudo

Para que um sistema de cor seja previsível, não basta definir boas intenções. É preciso que **mudanças numéricas correspondam a mudanças percebidas**. Esse é o ponto onde muitos sistemas falham silenciosamente: operam em espaços matemáticos convenientes, mas perceptualmente inconsistentes.

Espaços como RGB ou HSL não foram criados para modelar percepção humana. Foram criados para representar cores em dispositivos. Em RGB, por exemplo, a distância entre dois valores numéricos não guarda relação direta com o quanto essas cores parecem diferentes para o olho humano. Um pequeno ajuste em um canal pode gerar uma mudança visual enorme, enquanto ajustes grandes em outra região quase não são percebidos.

Quando um sistema tenta construir hierarquia, contraste e intensidade sobre um espaço desses, ele inevitavelmente recorre a correções empíricas. Ajusta-se “no olho”, cria-se exceções, adicionam-se tokens intermediários. O problema não está na execução; está na base.

Um **espaço perceptual** parte de um princípio diferente: duas cores que estão a uma mesma distância matemática devem parecer, para um observador humano médio, aproximadamente igualmente distantes. Não é uma promessa perfeita, mas é uma aproximação muito mais alinhada com a forma como enxergamos.

É nesse contexto que o OKLCH se torna relevante.

OKLCH é uma representação cilíndrica de um espaço perceptual moderno, derivado do OKLab. Ele organiza a cor em três componentes conceituais claros:

* **H (Hue)**: a identidade cromática. Aquilo que chamamos informalmente de “cor” — azul, verde, vermelho.
* **L (Lightness)**: a luminosidade percebida, do escuro ao claro.
* **C (Chroma)**: a intensidade perceptual da cor, o quão “viva” ou “apagada” ela parece.

Essa separação não é apenas elegante; ela é profundamente funcional. Cada eixo corresponde a uma dimensão perceptual distinta. Mover a cor ao longo de L altera a sensação de claro e escuro sem distorcer sua identidade. Ajustar C aumenta ou reduz presença cromática sem alterar a luminosidade. Alterar H muda a identidade da cor sem, necessariamente, torná-la mais clara ou mais intensa.

Em outras palavras: **as perguntas que o designer faz sobre cor passam a ter eixos próprios**.

Quando se quer resolver contraste, trabalha-se principalmente com L. Quando se quer resolver hierarquia de intensidade, trabalha-se com C. Quando se quer resolver significado, trabalha-se com H. Isso não significa que esses eixos sejam totalmente independentes, mas significa que eles deixam de estar acoplados de forma arbitrária.

Esse desacoplamento é o que permite ao Palette Kit ser determinístico. Quando o sistema precisa “ir para mais claro” ou “ir para mais escuro” para atingir contraste, ele sabe exatamente em que direção se mover. Não há tentativa e erro. Não há ajustes compensatórios imprevisíveis.

Outro ponto fundamental é que OKLCH se comporta de forma muito mais estável quando aplicado em diferentes contextos de ambiente. Em esquemas claros ou escuros, mudanças em L continuam correspondendo a mudanças percebidas de luminosidade. Isso é essencial para um sistema que resolve cores **em função do contexto**, e não como valores absolutos.

É importante ressaltar que OKLCH não é usado como formato final de entrega. Ele é o **espaço interno de resolução**. O sistema calcula cores em OKLCH porque esse é o espaço onde as decisões conceituais fazem sentido. Só depois disso ocorre a conversão para formatos compatíveis com plataformas — sRGB, Display-P3, hex, rgba.

Essa distinção é crucial. O designer não precisa “pensar em OKLCH”. Ele precisa apenas se beneficiar de um sistema que usa um modelo coerente por baixo. Assim como não é necessário entender a física da luz para confiar que um layout terá bom contraste, não é necessário dominar espaços perceptuais para tirar proveito deles.

Ao adotar OKLCH como base, o Palette Kit resolve um problema estrutural: elimina a distância entre intenção e resultado. Quando o sistema decide clarear uma cor, ela realmente parece mais clara. Quando decide reduzir intensidade, ela realmente parece recuar. Isso pode parecer óbvio, mas é exatamente o que não acontece em muitos sistemas atuais.

Sem um espaço perceptual, decisões como “aumentar contraste” ou “reduzir intensidade” são vagas. Com OKLCH, elas se tornam operações claras, previsíveis e reproduzíveis.

Esse é o ponto de transição do paper: a partir daqui, o sistema deixa definitivamente o território do ajuste empírico e entra no território do **modelo**. Um modelo que permite resolver relações entre cores de forma consistente, sem magia e sem surpresas.

Com essa base estabelecida, fica possível discutir métricas de contraste e acessibilidade de maneira mais honesta — entendendo seus limites, suas intenções e seus usos adequados.

É exatamente isso que a próxima seção aborda.

---

## 10. APCA vs WCAG: legibilidade não é uma fração

Durante anos, acessibilidade em interfaces digitais foi tratada como um problema de conformidade. Mede-se um número, compara-se com um limite mínimo e, se aprovado, o sistema segue adiante. Essa abordagem trouxe avanços importantes, mas também cristalizou um equívoco perigoso: o de que **legibilidade pode ser reduzida a uma fração matemática**.

A WCAG, em especial, popularizou a ideia de contraste como uma razão fixa entre luminâncias. Essa métrica foi fundamental em um momento histórico específico, quando o objetivo principal era criar um critério simples, verificável e amplamente aplicável. Mas simplicidade normativa não equivale a fidelidade perceptual.

O olho humano não percebe contraste como uma razão abstrata. Ele percebe diferença de claro e escuro de forma **assimétrica**, dependente de polaridade, tamanho do texto, peso tipográfico e contexto visual. Um texto claro sobre fundo escuro não é percebido da mesma forma que um texto escuro sobre fundo claro, mesmo que a razão numérica seja idêntica.

É exatamente nesse ponto que métricas tradicionais começam a falhar silenciosamente. Elas passam em testes formais, mas produzem experiências visuais desconfortáveis, cansativas ou ambíguas. Designers sentem isso intuitivamente, mas o sistema não oferece vocabulário para explicar o problema.

A APCA (Advanced Perceptual Contrast Algorithm) surge como uma tentativa de aproximar a métrica do fenômeno real. Em vez de tratar contraste como uma razão simétrica, a APCA modela contraste como **diferença perceptual de luminosidade**, levando em conta polaridade, resposta não linear do olho humano e condições reais de leitura.

O resultado não é um número “melhor”, mas um número **mais honesto**. Um valor de contraste APCA não pretende ser universal; ele expressa uma probabilidade de legibilidade em um contexto específico. Isso muda completamente a forma como o contraste deve ser interpretado.

No contexto do Palette Kit, essa distinção é crucial. O sistema não usa métricas de contraste como selos de aprovação, mas como **instrumentos de verificação**. APCA é adotada como métrica primária porque conversa melhor com o espaço perceptual em que o sistema opera. WCAG permanece relevante como fallback e referência de compatibilidade, não como verdade absoluta.

Essa escolha não é ideológica; é pragmática. Designers e desenvolvedores ainda precisam dialogar com normas existentes. Ignorar WCAG seria irresponsável. Mas tratá-la como única fonte de verdade perceptual seria igualmente problemático.

Ao reconhecer as limitações de cada métrica, o sistema evita outro erro comum: o da falsa segurança. Um contraste que “passa” em WCAG pode ser desconfortável em uso prolongado. Um contraste que falha por pouco pode ser perfeitamente legível em determinado contexto. Nenhuma métrica resolve isso sozinha.

Por isso, o Palette Kit nunca promete acessibilidade automática. Ele fornece ferramentas para **avaliar**, **mirar** e **ajustar** contraste de forma consciente. O designer continua responsável pela decisão final, mas agora essa decisão é informada por um modelo perceptual mais alinhado com a realidade.

Essa postura também muda a relação com exceções. Em vez de forçar todas as situações a caberem em um único número, o sistema aceita que alguns contextos exigem mais contraste, outros menos. Texto pequeno exige mais rigor do que texto grande. Informação crítica exige mais clareza do que informação auxiliar.

Legibilidade, afinal, não é um estado binário. É um espectro. Tratar esse espectro como uma fração fixa é simplificar demais um fenômeno complexo.

Ao integrar APCA e WCAG de forma consciente, o Palette Kit assume uma posição madura: normas são guias, não substitutos de julgamento. Métricas ajudam a reduzir erro, não a eliminar responsabilidade.

Essa clareza fecha um ciclo importante do paper. Agora que contraste foi reposicionado como escolha consciente, e que o espaço perceptual foi estabelecido como base, torna-se possível discutir como cores são efetivamente resolvidas umas em relação às outras — não como valores isolados, mas como elementos que coexistem no mesmo campo visual.

É nesse ponto que a resolução relacional deixa de ser um detalhe técnico e passa a ser uma consequência inevitável do modelo.

---

## 11. Resolver cores é resolver relações

Uma das ilusões mais persistentes no design de interfaces é a ideia de que cores podem ser escolhidas isoladamente. Define-se a cor de um texto, depois a cor do fundo, depois a cor da borda — como se cada decisão existisse em seu próprio compartimento. O resultado pode até parecer aceitável em um cenário específico, mas raramente sobrevive a mudanças de contexto.

Na percepção humana, **cores nunca existem sozinhas**. Elas são sempre percebidas em relação a outras cores que as cercam. Um texto não é claro ou escuro por si só; ele é claro ou escuro *em relação* ao fundo sobre o qual está. Uma sombra não é sutil ou intensa em termos absolutos; ela é percebida em função da superfície que recobre.

Ignorar essa natureza relacional da cor é o que leva a sistemas frágeis. Tokens definidos isoladamente funcionam apenas enquanto o contexto permanece estático. Quando o fundo muda, quando o esquema muda, quando o componente é reutilizado, tudo precisa ser recalibrado manualmente.

O Palette Kit parte de uma premissa diferente: **cores são resolvidas a partir de relações**, não de valores absolutos.

Essa ideia se materializa no eixo relacional do sistema. Em vez de perguntar apenas “qual cor é esta?”, o sistema pergunta “qual é a relação desta cor com a outra?”. As relações fundamentais consideradas são simples, mas suficientes: *on*, *over* e *under*.

A relação *on* descreve situações em que um elemento é percebido diretamente sobre outro. Texto sobre fundo. Ícone sobre botão. Rótulo sobre superfície. Nesses casos, contraste e legibilidade são centrais. Resolver a cor de um símbolo exige conhecer explicitamente a cor da superfície sobre a qual ele será aplicado.

A relação *over* descreve camadas que se sobrepõem parcialmente, como sombras, scrims ou estados de foco. Aqui, a percepção depende menos de contraste direto e mais de profundidade e separação espacial. A cor não precisa ser “lida”; ela precisa ser sentida como camada intermediária.

A relação *under* descreve o inverso: elementos que existem abaixo de uma superfície principal, influenciando sua percepção sem se tornarem protagonistas. Um brilho sutil sob um card, uma sombra projetada, um fundo de elevação. A função aqui é estrutural, não comunicativa.

Essas relações não são estados visuais arbitrários. Elas representam **formas distintas de interação perceptual**. Tratar um texto como se fosse uma sombra, ou uma sombra como se fosse texto, leva a soluções confusas e inconsistentes.

Ao tornar a relação explícita, o sistema elimina um tipo comum de adivinhação: decidir, implicitamente, para que lado mover uma cor quando algo precisa mudar. Clarear ou escurecer? Aumentar ou reduzir intensidade? Em um sistema não relacional, essas decisões são heurísticas frágeis. Em um sistema relacional, a direção da mudança emerge do próprio contexto.

Por exemplo, quando um texto precisa atingir maior contraste sobre uma superfície clara, o sistema sabe que deve se mover em direção a menor luminosidade. Em um fundo escuro, a direção é oposta. Essa decisão não é estética; é consequência direta da relação *on*.

O ponto crucial é que **o designer não precisa decidir essas direções**. Ele decide intenção, intensidade relativa e necessidade de contraste. A relação fornece ao sistema a informação que faltava para executar essa decisão de forma consistente.

Essa abordagem também impede comportamentos mágicos. O sistema não “tenta várias opções até funcionar”. Ele aplica regras claras baseadas na relação declarada. Se não houver solução possível dentro dos limites definidos, o sistema falha de forma explícita. Essa falha não é um bug; é um diagnóstico.

Resolver cores como relações traz um benefício adicional: **composabilidade**. Componentes deixam de depender de cores fixas e passam a depender de relações bem definidas. Um botão pode ser reutilizado em diferentes superfícies sem redefinir sua paleta, porque suas cores são sempre resolvidas em função do contexto onde aparecem.

Esse é o ponto em que o sistema deixa definitivamente de ser uma paleta e passa a ser um **modelo**. Um modelo que reconhece que cores fazem parte de um ecossistema visual dinâmico, não de uma lista estática de valores.

Ao aceitar que cor é relação, o design abandona a ilusão do controle absoluto e adota algo muito mais poderoso: **previsibilidade contextual**. Cada decisão tem efeito claro. Cada mudança de contexto produz um resultado coerente. Nada depende de sorte ou de ajustes manuais acumulados ao longo do tempo.

Com isso, quase todos os elementos do sistema já estão em jogo. Uso define o papel perceptual. Intensidade define hierarquia. Contraste define legibilidade. Espaço perceptual garante previsibilidade. Relação fornece direção.

Resta agora entender como tudo isso se comporta quando o sistema decide **não** agir — quando ele se recusa a adivinhar, a corrigir silenciosamente ou a esconder conflitos.

É exatamente aí que os limites do modelo se tornam tão importantes quanto suas capacidades.

---

## 12. Um sistema determinístico, sem magia

À medida que sistemas de design crescem, surge uma tentação recorrente: tornar o sistema mais “inteligente”. Ele começa a adivinhar intenções, corrigir escolhas silenciosamente, ajustar valores “para ajudar”. No curto prazo, isso parece conveniente. No longo prazo, destrói confiança.

Magia é confortável enquanto funciona. Quando falha, ninguém sabe por quê.

O Palette Kit rejeita deliberadamente essa abordagem. Ele não tenta ser esperto. Ele tenta ser **previsível**.

Determinismo, aqui, não significa rigidez. Significa que, dadas as mesmas decisões, o resultado será sempre o mesmo. Não há heurísticas escondidas, não há correções invisíveis, não há “ah, nesse caso especial a gente faz diferente”. Cada eixo do sistema responde a uma pergunta clara, e cada resposta influencia o resultado de forma explícita.

Essa escolha tem um custo. Um sistema determinístico precisa dizer “não” com mais frequência.

Quando uma combinação de decisões não pode ser resolvida de forma perceptualmente coerente — por exemplo, quando se pede alto contraste sobre uma superfície cuja intensidade impede essa leitura — o sistema não inventa uma solução intermediária. Ele falha. E essa falha é intencional.

Em sistemas mágicos, falhas são escondidas. O sistema “dá um jeito”, altera parâmetros, sacrifica consistência local para manter a aparência global. O resultado é um conjunto de decisões invisíveis que ninguém lembra de ter tomado, mas que passam a condicionar todo o design.

No Palette Kit, falhar é uma forma de comunicação.

Uma falha indica que duas ou mais decisões estão em conflito. Talvez a intensidade escolhida seja alta demais para aquele uso. Talvez o contexto seja incompatível com a intenção de contraste. Talvez o próprio papel do elemento precise ser reconsiderado. Em vez de mascarar o problema, o sistema o expõe.

Essa postura muda a relação do designer com o sistema. O sistema deixa de ser um assistente complacente e passa a ser um **interlocutor rigoroso**. Ele não substitui julgamento humano; ele o desafia.

Outro efeito importante do determinismo é a eliminação de dependência histórica. Em sistemas mágicos, o resultado final depende da ordem em que decisões foram tomadas, de exceções acumuladas, de correções feitas “só dessa vez”. O sistema passa a ter memória implícita.

No Palette Kit, não existe memória implícita. Cada resolução é feita do zero, a partir das decisões declaradas naquele contexto. Isso torna o comportamento do sistema estável ao longo do tempo, mesmo à medida que o produto evolui.

Esse rigor também cria uma linguagem comum entre designers e desenvolvedores. Quando algo não funciona, a conversa não gira em torno de “ajustar até ficar bom”, mas de identificar **qual eixo está mal definido**. É um problema de uso? De intensidade? De relação? De contraste? A discussão deixa de ser subjetiva e passa a ser estrutural.

Determinismo não elimina criatividade. Ele elimina ambiguidade desnecessária.

Ao remover a magia, o sistema cria espaço para decisões mais conscientes. Cada escolha tem consequências claras. Cada consequência pode ser antecipada. Isso é especialmente importante em produtos grandes, onde decisões de design se propagam para dezenas ou centenas de telas.

Um sistema previsível não promete perfeição visual em todos os cenários. Ele promete algo mais valioso: **compreensão**. Quem usa o sistema entende por que algo aconteceu e o que precisa mudar para obter outro resultado.

Essa compreensão é o que permite escalar design sem perder coesão. É o que permite que equipes diferentes tomem decisões alinhadas sem coordenação constante. É o que transforma um conjunto de regras em um modelo mental compartilhado.

Ao abdicar da magia, o Palette Kit assume um compromisso claro: nunca surpreender silenciosamente. Se algo muda, há um motivo. Se algo falha, há uma causa identificável. Se algo funciona, é porque as decisões foram coerentes.

Esse compromisso prepara o terreno para uma das partes mais importantes do sistema: **definir explicitamente o que ele se recusa a fazer**.

Porque, em design de sistemas, limites claros são tão importantes quanto capacidades sofisticadas.

---

## 13. O que este sistema deliberadamente se recusa a fazer

Todo sistema sério é definido tanto pelo que faz quanto pelo que **se recusa a fazer**. Em design de cores, essa recusa é especialmente importante, porque a tentação de “resolver tudo automaticamente” é constante. O Palette Kit estabelece limites claros não por dogmatismo, mas por responsabilidade.

A primeira recusa é a mais fundamental: **o sistema não adivinha intenção**. Ele não tenta inferir o que o designer “quis dizer” a partir de contexto implícito, nomes ambíguos ou padrões históricos. Se a intenção não foi declarada, ela não existe para o sistema. Essa recusa evita um problema comum: decisões invisíveis que só fazem sentido para quem as tomou.

O sistema também se recusa a **corrigir escolhas silenciosamente**. Se uma combinação não atinge o contraste desejado, o sistema não ajusta outros eixos para compensar. Ele não reduz intensidade “por baixo dos panos”, não muda direção de luminosidade sem autorização, não sacrifica coerência local para preservar aparência global. Correções silenciosas criam dívida conceitual. Aqui, elas são proibidas.

Outra recusa deliberada é a de **prometer acessibilidade automática**. O sistema não afirma que “tudo que sai daqui é acessível”. Essa promessa é intelectualmente desonesta. Acessibilidade depende de contexto, conteúdo, tipografia, tamanho, ambiente e uso real. O que o sistema faz é oferecer ferramentas para mirar contraste de forma consciente e verificável. O julgamento final continua sendo humano.

O Palette Kit também se recusa a **misturar eixos conceituais** em um único parâmetro. Não existem cores que carregam, ao mesmo tempo, uso, significado, estado e intensidade embutidos. Não existem atalhos semânticos como “primaryHoverTextStrong”. Se uma decisão envolve múltiplas dimensões, elas precisam ser declaradas separadamente. Essa recusa protege a legibilidade do próprio sistema.

Há ainda a recusa a **tratar cor como valor absoluto**. O sistema não opera com “cores finais” internas. Tudo é resolvido em função de contexto, relação e ambiente. Valores absolutos só existem na etapa final de serialização, quando precisam ser entregues à plataforma. Internamente, a cor é sempre um fenômeno relacional.

O sistema também não tenta ser **retrocompatível com maus modelos mentais**. Ele não replica escalas arbitrárias herdadas, não tenta acomodar nomenclaturas confusas, não mantém convenções apenas porque são populares. Essa recusa pode gerar atrito inicial, mas evita perpetuar problemas estruturais.

Outra linha clara é a recusa a **otimizar para casos extremos não declarados**. Se um design exige exceções frequentes, o sistema não tenta absorvê-las silenciosamente. Exceções são sinais de que o modelo precisa ser expandido ou que o uso não está bem definido. O sistema prefere expor esse atrito a escondê-lo.

Por fim, o Palette Kit se recusa a **substituir o designer**. Ele não escolhe cores “bonitas”, não decide hierarquia por conta própria, não determina significado. O papel do sistema é executar decisões humanas de forma coerente, não tomar decisões no lugar delas.

Essas recusas não são limitações acidentais. Elas são **posições de design**. Cada uma delas elimina um tipo de ambiguidade que, em outros sistemas, se acumula até se tornar inadministrável.

Ao deixar claro o que não faz, o sistema cria um espaço seguro para o que faz bem. Ele não promete conforto imediato, mas oferece algo mais valioso: previsibilidade, clareza e confiança ao longo do tempo.

Esse conjunto de recusas fecha o núcleo conceitual do modelo. A partir daqui, resta observar como essas escolhas se refletem no trabalho diário de quem projeta interfaces — não em teoria, mas na prática cotidiana.

É isso que a próxima seção aborda.

---

## 14. O que muda no trabalho diário do designer

Depois de toda a estrutura, conceitos e recusas, a pergunta inevitável é simples: *o que isso muda, de fato, no dia a dia de quem projeta interfaces?*

A resposta curta é: **muda o foco do trabalho**.

Em sistemas tradicionais, grande parte do esforço do designer em relação à cor é gasto resolvendo detalhes operacionais. Ajusta-se tom, clareia-se um fundo “porque o texto não leu”, escurece-se um ícone “porque não destacou”, cria-se uma variação “só para esse caso”. Essas decisões parecem pequenas, mas consomem tempo, atenção e energia cognitiva. Pior: raramente são reaproveitáveis.

No modelo proposto pelo Palette Kit, esse tipo de microgerenciamento deixa de ser necessário — não porque o sistema “faz tudo sozinho”, mas porque **o problema é recortado de forma diferente**.

O trabalho central do designer em relação à cor passa a se concentrar em **duas decisões fundamentais**:

1. **Intenção** — *qual significado essa cor carrega dentro do domínio do produto*
2. **Intensidade (level)** — *quão presente essa cor deve ser na hierarquia visual*

Essas são decisões genuinamente de design. Elas exigem compreensão do produto, do conteúdo, do fluxo do usuário e do impacto emocional desejado. São decisões onde a sensibilidade do designer é insubstituível.

Todo o restante deixa de ser uma escolha manual recorrente e passa a ser **consequência do contexto**.

O designer não precisa decidir, a cada aplicação, se o texto deve clarear ou escurecer para atingir contraste. Ele não precisa recalcular como uma cor se comporta em light ou dark. Ele não precisa ajustar saturação para compensar fundo diferente. Essas decisões não desaparecem; elas são **resolvidas sistemicamente** a partir de informações já declaradas.

O “onde” a cor aparece (uso), a relação com outras cores (on, over, under) e o ambiente (esquema, contexto perceptual) fornecem ao sistema tudo o que ele precisa para executar essas decisões de forma coerente. O designer não perde controle; ele deixa de exercer controle onde ele é menos eficaz.

Esse deslocamento tem um efeito psicológico importante. Em vez de ficar preso em ajustes visuais reativos, o designer passa a pensar em termos de **estrutura**. Qual elemento deve liderar a atenção? Qual deve recuar? Onde a informação precisa ser inequívoca? Onde pode ser sutil?

A conversa com desenvolvimento também muda. Em vez de discutir valores específicos (“esse azul está muito claro”), a discussão passa a girar em torno de decisões conceituais (“esse elemento deveria ter mais hierarquia”, “essa informação precisa de mais contraste”). O sistema se encarrega de traduzir essas decisões em valores concretos.

Outro benefício prático é a redução de inconsistência entre telas e estados. Como as decisões são declarativas e resolvidas em função do contexto, o mesmo componente se comporta de forma previsível em diferentes superfícies e esquemas. O designer não precisa redesenhar mentalmente cada variação.

Isso também facilita revisão e iteração. Se algo não funciona, o problema é mais fácil de localizar. Não é “a cor está errada”; é “a intensidade está alta demais para esse uso”, ou “a intenção de contraste é incompatível com esse contexto”. O erro deixa de ser estético e passa a ser estrutural.

Importante notar que esse modelo **não empobrece a expressão visual**. Ele apenas desloca a criatividade para um nível mais alto. Em vez de criar variações ad hoc, o designer cria sistemas coerentes de hierarquia e significado. A expressividade emerge da combinação de intenções e níveis, não de exceções acumuladas.

Para designers experientes, isso costuma gerar um sentimento curioso: menos decisões pequenas, mais decisões importantes. Menos tempo “ajustando”, mais tempo pensando. Menos ansiedade sobre consistência, mais confiança de que o sistema vai se comportar como esperado.

No fim, o Palette Kit não pretende ensinar designers a escolher cores. Ele parte do princípio de que designers já sabem fazer isso. O que ele oferece é uma forma de **fazer com que essas escolhas sobrevivam ao crescimento do produto**, à multiplicação de contextos e à colaboração em escala.

Quando a cor deixa de ser um detalhe frágil e passa a ser parte de um modelo estrutural, o trabalho do designer se torna mais claro, mais comunicável e, paradoxalmente, mais livre.

Resta apenas reconhecer que nenhum modelo é universal — e que assumir limites faz parte da maturidade de qualquer sistema.

É isso que fecha o paper.

---

## 15. Onde esse modelo pode falhar

Nenhum modelo que se proponha estrutural pode fingir universalidade. Fazer isso seria repetir exatamente o erro que este paper critica: esconder limites sob uma aparência de completude. Reconhecer onde um modelo pode falhar não o enfraquece; **o torna confiável**.

O primeiro limite evidente do modelo é que ele **exige decisão explícita**. Para equipes acostumadas a sistemas permissivos, isso pode gerar fricção inicial. Não há atalhos semânticos, não há “defaults inteligentes” que resolvem tudo sozinhos. Intenção, intensidade e uso precisam ser declarados. Em contextos onde o design é tratado como algo secundário ou apressado, essa exigência pode ser percebida como custo extra.

Outro ponto é que o modelo **não otimiza para exploração visual livre**. Em produtos altamente experimentais, artísticos ou expressivos, onde a intenção é romper padrões constantemente, a previsibilidade do sistema pode parecer restritiva. O Palette Kit foi pensado para produtos que precisam escalar consistência, não para peças únicas ou experiências puramente exploratórias.

Há também um limite cognitivo. Embora o sistema reduza microdecisões no longo prazo, ele exige que designers compreendam e adotem um **modelo mental mais estruturado**. Para profissionais em início de carreira, ou para equipes sem cultura de design systems, essa curva de aprendizado pode ser significativa. O ganho vem com o tempo, não instantaneamente.

Outro cenário delicado envolve produtos cujo domínio semântico é extremamente fluido. Se a própria intenção das cores muda constantemente, ou se o significado cromático é propositalmente ambíguo, o eixo de intenção pode se tornar instável. O sistema assume que o domínio possui algum grau de estabilidade conceitual. Sem isso, qualquer modelo começa a ranger.

Do ponto de vista técnico, o uso de espaços perceptuais e métricas mais sofisticadas implica **dependência de boas implementações**. Se a resolução perceptual for mal implementada, ou se conversões finais forem feitas de forma descuidada, os benefícios conceituais se perdem. O modelo não protege contra implementação ruim; ele apenas a torna mais visível.

Também é importante reconhecer que o modelo **não substitui revisão visual**. Embora reduza inconsistências e surpresas, ele não elimina a necessidade de olhar para o resultado final. Percepção humana é complexa demais para ser totalmente capturada por qualquer modelo. O sistema reduz erro; não elimina julgamento.

Por fim, o modelo pode falhar culturalmente. Em ambientes onde decisões precisam ser rápidas, pouco discutidas ou altamente políticas, a exigência de clareza conceitual pode entrar em conflito com dinâmicas existentes. Um sistema que pede decisões explícitas expõe responsabilidades — e nem toda organização está pronta para isso.

Esses limites não são defeitos acidentais. Eles são consequências diretas das escolhas feitas ao longo do modelo. O Palette Kit troca conforto imediato por previsibilidade de longo prazo. Troca flexibilidade implícita por controle explícito. Troca magia por entendimento.

Em contextos onde essas trocas fazem sentido, o modelo oferece ganhos reais. Em contextos onde não fazem, ele provavelmente parecerá pesado, excessivo ou desnecessário — e isso é um sinal saudável de que nenhum sistema deve ser aplicado indiscriminadamente.

Reconhecer esses limites fecha o ciclo do paper de forma honesta. O que foi apresentado aqui não é uma fórmula universal, mas uma proposta estruturada para lidar com um problema recorrente em produtos digitais complexos.

A cor, nesse modelo, deixa de ser um conjunto de escolhas isoladas e passa a ser tratada como um **sistema de relações, decisões e consequências**. Um sistema que pode ser aprendido, discutido, criticado — e, se necessário, abandonado.

E isso, por si só, já é um avanço significativo em relação ao estado atual da maioria dos sistemas de cor.

---

## 16. Conclusão: cor como sistema, não como paleta

Ao longo deste paper, a cor foi deliberadamente deslocada de um território confortável — o da escolha pontual, da paleta estática, do ajuste empírico — para um território mais exigente: o do **sistema**.

Esse deslocamento não tem como objetivo complicar o trabalho do designer, mas torná-lo sustentável. À medida que produtos crescem, decisões isoladas deixam de sobreviver. O que sustenta consistência não é bom gosto acumulado, mas estrutura compartilhada.

O modelo apresentado aqui parte de uma premissa simples: cores não são apenas valores visuais, mas **decisões que operam em contexto**. Onde a cor aparece, o que ela significa, quão intensa deve ser, com o que ela se relaciona e em que ambiente é percebida são perguntas diferentes — e precisam de respostas distintas.

Ao separar essas perguntas em eixos explícitos, o sistema reduz ambiguidade sem eliminar nuance. Ele não tenta prever todas as situações, nem promete resolver automaticamente todos os conflitos. Em vez disso, oferece algo mais raro: previsibilidade. Quando algo funciona, há um motivo claro. Quando algo falha, a causa é identificável.

Esse modelo também reposiciona o papel do designer. Em vez de ajustar valores até “parecer certo”, o designer passa a decidir **intenção e hierarquia**. Essas são decisões profundamente humanas, dependentes de contexto, produto e sensibilidade. Todo o restante — contraste direcional, compensação perceptual, adaptação a ambientes — torna-se consequência dessas decisões, não substituto delas.

Nada disso pretende ser universal. Há contextos onde esse rigor será excessivo, onde a expressividade exige ruptura constante, onde a previsibilidade não é prioridade. Reconhecer isso faz parte da honestidade do modelo.

Ainda assim, para produtos digitais complexos, colaborativos e em constante evolução, tratar cor como sistema — e não como paleta — deixa de ser uma opção sofisticada e passa a ser uma necessidade.

Este paper não propõe uma verdade definitiva sobre cor. Ele propõe um **jeito mais explícito, discutível e ensinável de lidar com ela**. Um modelo que pode ser adotado, criticado, adaptado ou rejeitado — mas que, acima de tudo, torna visíveis decisões que antes ficavam escondidas.

Se isso provocar desconforto, questionamento ou discordância, então cumpriu seu papel. Porque sistemas melhores não nascem do consenso imediato, mas da clareza sobre o que está sendo decidido — e por quê.
