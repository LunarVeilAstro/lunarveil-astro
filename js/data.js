// data.js — All static data: planet interpretations, tarot deck, compass,
//   fortune slips, RP tiers, lodge game answers
// Depends on: astronomy.js (SIGNS, _L)

// ═══════════════════════════════════════════════════════════════════════════
//  INTERPRETATION DATA
// ═══════════════════════════════════════════════════════════════════════════

const PLANET_SIGN_ZH = {
  "Sun": {
    "0": "太阳白羊赋予你开拓者的灵魂——勇敢、直接、充满生命力。你不喜欢等待，更不愿被规则束缚，是天生的先行者。在事业上适合创业或需要快速决策的领域；感情中主动热情，但需要学会耐心倾听伴侣。此生课题是将冲劲转化为持久的成就。",
    "1": "太阳金牛让你拥有大地般的沉稳和坚韧。你重视物质安全与感官享受，对美和财富有天然的判断力。赚钱是你建立安全感的核心方式之一，理财能力通常不弱。感情中忠诚且持久，但占有欲较强。需警惕因过度追求稳定而错过改变的机会。",
    "2": "太阳双子赋予你永不疲倦的好奇心和敏捷的思维。你擅长收集信息和连接人脉，是天生的沟通者。职业上适合媒体、教育、销售等多元领域。感情中需要智识的碰撞和不断的交流，伴侣必须能跟上你的思维速度。最大的功课是学会专注和深入。",
    "3": "太阳巨蟹让你将情感和安全感置于人生核心。家庭、根源和亲密关系是你力量的源泉。你天生具有滋养他人的能力，在照顾型职业中尤为出色。感情中温柔体贴但防御心重，需要对方先证明忠诚和可靠。财务决策常受情绪影响，需建立理性框架。",
    "4": "太阳狮子赋予你天生的舞台魅力和创造力。你渴望被看见、被认可，内心深处相信自己注定不凡。适合领导岗位和创意产业。感情中热情浪漫，需要被伴侣崇拜和赞美。财运上敢投敢花，大方慷慨，但需学会储蓄和规划。此生课题是在自信与谦逊间找到平衡。",
    "5": "太阳处女让你追求完美和秩序。你拥有精密的分析能力和服务精神，做事一丝不苟。职业上适合技术、医疗、研究等需要专业深度的领域。感情表达克制而务实，用行动而非言语证明爱。财运上精打细算，但可能因过度谨慎错过投资机会。学会接纳不完美是你的成长方向。",
    "6": "太阳天秤赋予你优雅的社交能力和公正的判断力。你天生追求和谐与平衡，擅长合作和外交。职业上适合法律、公关、设计等需要审美和协调能力的领域。感情是你人生中最重要的主题之一——你需要在关系中照见自己。决策时容易犹豫不决，这是你需要克服的短板。",
    "7": "太阳天蝎让你拥有X光般的洞察力和惊人的意志力。你不满足于表面的答案，总是在追问真相和深度。职业上适合研究、心理、金融等需要穿透力的领域。感情中全情投入，爱恨分明，背叛是你最难原谅的事。财运上有投资眼光，但需避免因执念而孤注一掷。",
    "8": "太阳射手赋予你永远在路上的灵魂。你热爱自由、冒险和哲学探索，生命的意义在于不断扩展视野。职业上适合教育、出版、国际事务等领域。感情中不喜欢被束缚，需要一个能和你一起探索世界的伴侣。财运上乐观但容易过于乐观，需建立风险意识。",
    "9": "太阳摩羯让你少年老成，早早承担起责任。你目标明确、意志坚定，耐心和耐力远超同龄人。职业上具有极强的事业心和执行力，适合管理和领导岗位。感情中克制而负责，用成就而非言语来表达爱。财运上擅长长线布局，但需学会享受奋斗的过程而不只是结果。",
    "10": "太阳水瓶赋予你独立前卫的思想和人道主义情怀。你天生与众不同，不按常理出牌。职业上适合科技、社群、创新领域。感情中需要精神共鸣和充分的个人空间，传统的关系模式可能不适合你。财运上常有独特的收入来源，但不稳定。学会在独立与合作间找到平衡是此生课题。",
    "11": "太阳双鱼让你拥有无边界的慈悲心和丰富的想象力。你的灵魂柔软而深邃，天然通晓艺术和灵性领域。职业上适合艺术、疗愈、慈善等需要共情能力的工作。感情中浪漫梦幻，容易在爱中失去自我边界。财运上直觉敏锐，但需建立实际的金钱管理习惯——你此生的修行是在现实世界中为梦想建造容器。"
  },
  "Moon": {
    "0": "月亮白羊让你的情绪表达直接而热烈。内心永远住着一个战士，需要不断的新刺激来保持情感活力。在亲密关系中，你反应迅速但缺乏耐心，容易因小事爆发但转头就忘。你的情感安全感来自「行动」——感到不安时你会本能地想做点什么。",
    "1": "月亮金牛给你最稳定的情绪底色。你需要物质安全和感官舒适来安抚内心，美食、美物、稳定的生活环境是你情感健康的基石。关系中忠诚度极高，但一旦受伤恢复缓慢。财运上的安全感直接影响你的情绪状态——存款数字是你内心平静的晴雨表。",
    "2": "月亮双子让你的情感需求多变且以智识为核心。你需要不断的信息交流和新鲜体验来获得情绪满足。内心永远年轻，机智善辩，但可能因思维过度活跃而难以在情感中稳定下来。伴侣一定要能和你在智力上交锋，否则你会感到无聊。",
    "3": "月亮巨蟹是月亮最自然的位置——情感丰富、直觉力强、极度重视家庭和亲密关系。你的情绪如潮汐般起伏，容易吸收周围人的情绪。在爱中你是天生的照顾者，但也需要被悉心呵护。情感安全感是你人生的基石，每当它被动摇，一切都会受影响。",
    "4": "月亮狮子让你的内心渴望被赞美和崇拜。情感表达戏剧化而热烈，你需要伴侣的绝对忠诚和持续关注。自尊心是你情绪健康的核心——当你感到被忽视或低估时会变得非常敏感。创造性的自我表达和舞台上的光芒是你情感滋养的重要来源。",
    "5": "月亮处女让你的情感表达谨慎克制。你通过服务和照顾他人来表达爱，内心追求完美但容易担忧和焦虑。在感情中你对自己和对方都有极高要求，这可能导致关系紧张。建立健康的生活秩序和日常规律是你的情绪稳定器。",
    "6": "月亮天秤赋予你对和谐关系的深切渴望。你害怕冲突和孤独，需要伴侣的陪伴来获得情感满足。优雅温和的外表下，你其实对关系中的不平衡非常敏感。审美和美的事物是你情绪调节的重要方式。学会在取悦他人和照顾自己之间找到平衡是重要课题。",
    "7": "月亮天蝎让你的情感世界如深海般强烈而神秘。爱恨分明，内心隐藏着巨大的情感能量和直觉力。你需要绝对的信任和灵魂层面的交融，肤浅的关系无法满足你。你具有极强的情绪再生能力——每一次的情感危机都是一次蜕变的契机。",
    "8": "月亮射手让你的情感表达乐观开朗。内心充满对远方的向往和对生命意义的追寻，不喜欢被琐碎日常束缚。你需要一个能和你一起成长和探索的伴侣，限制你自由的人会让你本能地逃离。旅行、学习和哲学是你情绪充电的方式。",
    "9": "月亮摩羯让你的情感表达克制而内敛。你重视责任和承诺，用行动而非言语表达爱。内心强大但不轻易表露，情绪管理能力是你在职场中的优势。但在亲密关系中，你需要学会允许自己脆弱——不是所有事都需要一个人扛。",
    "10": "月亮水瓶赋予你独立理性的情感模式。你需要精神共鸣和充分的个人空间，传统的情感依赖模式可能让你感到窒息。你关心人类多于关心个人，理想主义和社群意识是你情绪世界的重要组成部分。与他人的情感距离是你保护自己的方式，但也可能成为孤独的来源。",
    "11": "月亮双鱼让你拥有无边界的共情能力和丰富的内心世界。你的情绪敏锐度极高，能感知他人未说出口的感受。艺术和灵性是你情感滋养的重要来源。在感情中你容易迷失自我边界，将伴侣的课题当作自己的课题。你需要建立的不是更厚的墙，而是更清晰的界限。"
  },
  "Mercury": {
    "0": "水星白羊让你的思维和表达直接而迅速。说话不拐弯抹角，想到什么说什么。学习能力强但缺乏耐心，适合开创性思考和快节奏的信息处理。在谈判或辩论中可以成为犀利的对手，但需要注意不要因为说话太冲而伤到关系。",
    "1": "水星金牛让你的思维稳健而务实。学习速度不快，但一旦理解就根深蒂固。你的表达方式温和而有说服力，重视实际经验而非抽象理论。在财务决策和长期规划方面具有天赋。沟通风格偏保守，不喜欢无意义的闲聊。",
    "2": "水星双子是水星最活跃的位置——思维敏捷、口才出众、信息处理速度极快。你天生适合写作、教学、媒体或销售等需要沟通技巧的工作。好奇心驱动你不断学习新事物，但也容易浅尝辄止。你的思维需要在广度和深度之间找到平衡。",
    "3": "水星巨蟹让你的思维受情绪和记忆的深刻影响。你的记忆力极强，尤其是与情感体验相关的信息。直觉式的思维方式让你善于捕捉言语之外的信息。沟通风格温和而有同理心，适合从事需要情感智慧的领域。但需要注意不要让情绪完全主导判断。",
    "4": "水星狮子赋予你创造性和戏剧化的表达方式。你善于宏观思考和故事讲述，有将复杂想法包装得引人入胜的天赋。适合领导力沟通、创意策划、公共演讲等领域。你可能对细节不太有耐心，需要培养团队中能帮你落实想法的人。",
    "5": "水星处女是水星最强的位置之一——分析能力卓越，思维严谨细致。你善于分类、整理和优化信息，是天然的编辑、分析师或技术专家。工作中追求精确和效率。但过度追求完美可能让你陷入分析陷阱，迟迟无法做出最终判断。",
    "6": "水星天秤让你善于从多角度看问题。你的表达优雅得体，是天生的外交官和谈判者。追求思维上的和谐与公正，在冲突中能站在中立位置调和各方。适合法律、公关、咨询等需要平衡不同利益的工作。决策时可能犹豫不决——你需要相信自己的判断。",
    "7": "水星天蝎赋予你穿透表象的思维能力。你不满足于浅层信息，擅长挖掘真相和隐秘的动机。适合研究、调查、心理分析等需要深度的工作。你的表达简短但有力量，话不多但每句都在点上。保守秘密是你的天赋，但注意不要走向偏执和怀疑一切。",
    "8": "水星射手让你的思维开阔而乐观。你喜欢探索哲学、宗教、文化等宏观话题，对知识的渴望驱动你不断远行——无论是实际的还是心智的。学习方式跳跃式，擅长把握整体图景但不耐烦细节。适合教育、出版、国际事务等领域。",
    "9": "水星摩羯让你的思维严谨务实，逻辑性和结构性极强。学习方式循序渐进，适合需要长期积累和系统规划的领域。你的表达方式简洁高效，不说废话。在商业、管理、工程等需要精确思维和长期规划的领域有天然优势。",
    "10": "水星水瓶让你的思维独特而前卫。你不按常理出牌，常有意想不到的洞见和创新想法。适合科技、发明、社会创新等需要前瞻性思维的领域。你关心人类进步和社会议题，善于发现未来的趋势。你的沟通风格可能有些抽离，在亲密沟通中需要注意情感温度。",
    "11": "水星双鱼赋予你诗意和直觉式的思维方式。你的大脑不以线性逻辑运作，而是以图像、感受和联想。适合艺术创作、音乐、灵性疗愈等领域。你的表达能力可能不如其他配置清晰，但传达的情感和氛围是无与伦比的。日常逻辑表达需要刻意练习。"
  },
  "Venus": {
    "0": "金星白羊让你在爱情中主动而热情。你喜欢追求和征服带来的刺激感，被动等待不是你的风格。审美直接大胆，喜欢鲜明的色彩和风格。感情中需要保持新鲜感和挑战性，但要注意冲动和三分热度的倾向。财运上果断但需要加强规划。",
    "1": "金星金牛是金星最舒适的位置——你在爱情中忠诚稳定，重视感官享受和物质基础。喜欢自然舒适的美学风格，对品质有天然的判断力。感情慢热但持久，一旦交付真心就坚定不移。财运上具有积累财富的本能，对投资和保值有良好直觉。",
    "2": "金星双子让你在爱情中追求智识的交流和多样性。你的魅力来自机智的谈吐和永不枯竭的好奇心。容易被聪明有趣的人吸引，审美多元化且时常变化。在感情中需要持续的新鲜刺激，但也可能因此难以做出长期承诺。适合以沟通和社交为核心的工作。",
    "3": "金星巨蟹让你在爱中极度重视情感安全感。你温柔体贴，天然知道如何让伴侣感到被照顾和被珍视。喜欢营造温馨的家庭氛围，念旧且具有母性光辉。在感情中容易因害怕受伤而筑起保护壳，需要对方先证明忠诚。财运上倾向于储蓄和保守投资。",
    "4": "金星狮子让你在爱情中热情浪漫、光芒四射。你喜欢被追求和赞美，付出的爱也是慷慨而戏剧化的。审美华丽，喜欢能让你在人群中脱颖而出的风格。需要伴侣的持续关注和认可。财运上有赚大钱的野心和魅力，但消费上也相当大方。",
    "5": "金星处女让你在爱情中克制而理性。你通过实际行动而非华丽言辞来表达爱——为你爱的人做事、解决问题、提供实用的帮助。审美简约精致，注重细节和品质胜过数量。感情中对伴侣有较高标准，有时过于挑剔。财运上精打细算，擅长发现性价比高的东西。",
    "6": "金星天秤是金星最强的位置——你天生懂得爱与美的艺术。追求和谐平等的关系，善于经营感情中的平衡。审美优雅经典，有出色的品味。害怕孤独，在关系中容易为了维持和谐而过度妥协。财运上可能因追求品质生活而花费较多，但你的社交资源往往能带来回报。",
    "7": "金星天蝎让你在爱情中全情投入、渴望灵魂深处的连接。占有欲强但忠诚，一旦爱上便是刻骨铭心。审美神秘而性感，喜欢有深度和故事感的人和事。在感情中不容易原谅背叛。财运上有投资天赋，能洞察价值被低估的机会，但需避免因执念造成损失。",
    "8": "金星射手让你在爱情中乐观开放、热爱自由。你喜欢跨国跨文化的浪漫，容易被不同背景的人吸引。审美自由奔放，热爱异域文化和冒险。在感情中不喜欢被束缚，需要伴侣能接纳你的独立性。财运上好运常来但缺乏规划，需要在乐观和实际之间找到平衡。",
    "9": "金星摩羯让你在爱情中谨慎而认真。你不轻易陷入感情，但一旦确定关系就会认真对待并承担责任。审美经典低调，重视品质和长久价值而非潮流。在感情中可能显得有些冷淡和务实，但你用忠诚和实际行动来表达爱。财运上具有极强的长期积累和投资规划能力。",
    "10": "金星水瓶让你在爱情中独立自由、不拘一格。你不需要传统的关系模式——精神共鸣和个人空间比浪漫仪式更重要。审美前卫独特，喜欢实验性和与众不同的风格。你吸引人的地方恰恰是你的与众不同。财运上可能有来自社群、互联网或创新领域的收入。",
    "11": "金星双鱼是金星最高的表达——你在爱情中浪漫梦幻、具有无条件的慈悲心。爱对你来说是灵魂的融合而非物质的交换。审美富有艺术气息和灵性色彩。容易被需要帮助的人吸引，在感情中需要注意自我保护。财运上直觉力强，但需建立实际的金钱管理习惯。"
  },
  "Mars": {
    "0": "火星白羊是火星最强的位置——行动力爆表，竞争意识极强。你在面对挑战时反应迅速，是天生的先锋和领袖。行动方式直接果敢，但忍耐力有限，容易对长期项目失去耐心。在事业、运动和需要快速决断的领域有天然优势。感情中热情主动，需要释放能量的出口。",
    "1": "火星金牛让你的行动稳健而持久。启动速度慢，但一旦开始就坚定不移。你的耐力极强，适合需要长期坚持才能见到成果的领域。对物质和感官层面的追求驱动着你的行动力。在感情中你的欲望深沉而持续，但可能显得过于固执或占有欲强。",
    "2": "火星双子让你的行动方式灵活多变。你擅长多任务处理，精力分散但效率高。沟通、写作、旅行和智力挑战是你释放能量的主要途径。在需要快速反应和适应力的场合你表现出色。感情中你需要智识的刺激和持续的交流来维持热情。",
    "3": "火星巨蟹让你的行动受情绪和保护欲驱动。为家人和爱人而战时你最为勇猛。你的行动力是间歇性的——情绪高涨时无所不能，低落时需要安全港。具有极强的守护本能，但在职场中有时因情绪因素影响了行动的一致性。",
    "4": "火星狮子赋予你戏剧化的行动风格和领导魅力。你需要被认可和赞赏来保持动力，在团队中自然地走向领导位置。你的行动具有表演性——当你站在聚光灯下时表现最好。感情中热情主动且慷慨，但需注意不要用支配替代爱护。",
    "5": "火星处女让你的行动精准高效。你善于制定详细计划并严格执行，完美主义是你的驱动力。在需要精确性、手艺和分析能力的工作中表现出色。感情中通过服务的行动来表达爱——为你爱的人解决问题就是你的浪漫。需注意不要因过度自我批判而挫伤行动力。",
    "6": "火星天秤让你在行动中注重公平和协作。你不喜欢独自冲锋陷阵，更擅长调动团队力量。你的决策过程需要权衡各方利益，这使你成为一个公正的领导者，但也可能因过度权衡而行动迟缓。在感情和合作中，你需要伙伴才能发挥最佳行动力。",
    "7": "火星天蝎赋予你极强的意志力和持久的战斗力。不鸣则已一鸣惊人——你不需要时刻显示自己的力量，但在关键时刻爆发力惊人。具有战略思维，适合需要深度和坚韧的领域。感情中性魅力强烈，欲望深沉。你对背叛的反应是毁灭性的。",
    "8": "火星射手让你行动充满热情和冒险精神。热爱运动、旅行和户外挑战，乐观积极的心态是你的最大驱动力。你行动的方向是不断扩展视野和获得新体验。在需要热情和信念的事业中你表现最佳。感情中追求自由和共同的冒险，不喜欢被日常琐事束缚。",
    "9": "火星摩羯让你行动有计划、有纪律、有目标。你的执行力极强，一旦确定方向就会坚定不移地推进。成就导向驱动着你的每一步行动。在职场中你是一个可靠的力量，但可能显得过于严肃。感情中用实用行动表达爱，比起浪漫言辞更擅长为你爱的人提供实质支持。",
    "10": "火星水瓶赋予你独特不羁的行动风格。你按自己的节奏和方式行事，不受传统和权威的束缚。你的行动力集中在改革、创新和群体事业上。在需要突破常规的领域你表现最佳。感情中需要充分的自由和空间，传统的关系规则对你来说不是必须遵守的。",
    "11": "火星双鱼让你的行动受直觉和灵感驱动。看似柔弱实则柔韧——你的行动方式如水般适应力强。艺术创作、灵性实践和帮助他人是你释放能量的主要途径。在需要共情和想象力的领域中有独特优势。你可能不是最有执行力的配置，但你的行动具有深刻的感染力。"
  },
  "Jupiter": {
    "0": "木星白羊让你通过勇气、冒险和竞争获得成长。你的好运来自敢于当机立断和走在最前面。事业上适合开创性角色，桃花容易发生在竞争或运动场合。财运机会常在你主动出击时降临——等待不是你的幸运策略。",
    "1": "木星金牛让你通过积累、耐心和实际判断获得扩张。财富运是此配置中最突出的天赋——你不追求快钱，但长期稳健的财务增长是你的标志。感情中的幸运来自稳定和真诚的付出。你的福报常在缓慢而确定的过程中显现。",
    "2": "木星双子让你通过信息、学习和人脉网络获得机遇。你的口才和对信息的敏感性是最大的财富催化剂。事业上适合多元化发展，桃花运来自社交场合和智识交流。财运机会常在你最不经意的时候通过朋友或新信息出现。",
    "3": "木星巨蟹让你通过情感连接和家庭滋养获得成长。幸运来自直觉和对他人需求的敏感——你给予的温暖总会以某种方式回流。家庭和房产方面常有福报。感情中的好运来自你愿意照顾好自己和他人的情感需求。",
    "4": "木星狮子让你通过创造性的自我表达和领导力获得扩张。你的自信和舞台魅力是最大的财富催化剂。事业上被看见和被认可的机会远超常人。桃花运旺盛——你走到哪里都自带光环。财运机会来自你的个人品牌和影响力。",
    "5": "木星处女让你通过服务、精细化的工作和不断提升的专业能力获得成长。你的幸运在于把事做对、做细、做到极致。事业上的专业口碑是最可靠的财富来源。感情中的好运来自你真诚的付出和谦逊的态度——不求回报时反而得到最多。",
    "6": "木星天秤让你通过合作、外交和人际关系的平衡获得机遇。好的伴侣和合作伙伴是你最大的幸运来源。事业上适合需要协商和审美的领域。桃花运在社交和艺术场合最旺。财运机会常通过合作关系和人际网络到来。",
    "7": "木星天蝎让你通过深度转化、资源整合和策略性投资获得成长。你的投资眼光和资源运作能力是最大的财富天赋。事业上的成功来自深度的专业能力和战略思维。感情中的幸运在于你愿意面对自己的阴影并进行深刻的自我蜕变。",
    "8": "木星射手是木星最强的位置——通过旅行、高等教育、哲学探索和跨文化体验获得无限扩展。你的开放心态和对生命的热情是最大的财富。事业上适合国际化和教育领域。桃花运在旅行和进修中最旺盛。财运机会常有异国或跨文化的色彩。",
    "9": "木星摩羯让你通过努力、纪律和长期规划获得成长。虽然木星在此位置不够自如，但你的幸运在于持续不懈的付出——当别人已经放弃时你还在坚持。事业上的社会地位是最大的财富来源。财务安全感来自长线布局和稳定的职业晋升。",
    "10": "木星水瓶让你通过创新、社群参与和前瞻性的愿景获得扩张。你的独特思维和人道主义情怀是最大的财富催化剂。事业上适合科技、社群和创新领域。桃花运常在社群和共同事业中悄然绽放。财运机会来自非传统渠道和志同道合的群体。",
    "11": "木星双鱼让你通过灵性、艺术和慈悲心获得成长。你的直觉力和想象力是最大的财富来源。事业上适合艺术、疗愈和慈善领域。感情中的好运来自你无分别的爱和共情能力。财运上需在理想主义和实际管理之间找到平衡。"
  },
  "Saturn": {
    "0": "土星白羊：你此生的核心课题是学会耐心和策略性的行动。你被要求将白羊的冲动转化为持续的努力和有序的推进。事业上只有通过纪律才能将领导的潜力转化为实际的成就。感情中需要学会在自我主张和妥协让步之间找到平衡。",
    "1": "土星金牛：你此生的核心课题是建立健康的价值观和自我价值感。对物质安全感的过度执着需要被审视。事业上适合在稳定中逐步攀升，不适合高风险的操作。财运是你需要修行的重点领域——不是挣钱能力的问题，而是与金钱的心理关系。",
    "2": "土星双子：你此生的核心课题是学会专注和深度的思考。信息碎片化和浅尝辄止是你容易陷入的模式。事业上需要选择一个领域深耕而非不断切换方向。沟通是你的天赋也是你的课题——学会在合适的时候保持沉默同样重要。",
    "3": "土星巨蟹：你此生的核心课题是建立情绪边界和内在安全的根基。你容易承担超出自己承受范围的情感责任。事业上情感智慧是你的优势，但需要防止被他人的需求淹没。学会在照顾他人和保护自己之间取得平衡是你此生最重要的功课。",
    "4": "土星狮子：你此生的核心课题是将自我表现转化为真正的创造和服务。你被要求从「被看到」走向「照亮他人」。事业上的领导力需要通过谦逊和持续付出来赢得。感情中需要学会爱不是索取关注，而是给予真诚的看见。",
    "5": "土星处女：你此生的核心课题是接纳不完美和自我慈悲。过度批判和完美主义是你最沉重的负担。事业上你的专业能力极强，但焦虑可能阻碍你发挥。感情中需要学会关系的本质不是完美而是成长。当你停止苛责自己，世界也会对你温柔。",
    "6": "土星天秤：你此生的核心课题是学会建立健康的边界和独立决策的能力。过度依赖他人的认可和回避冲突是你需要克服的模式。事业上你的协调能力是优势，但需要在关键时刻坚定立场。感情中真正的亲密不是融合，而是两个独立完整的人的选择。",
    "7": "土星天蝎：你此生的核心课题是学会信任和放下控制。对背叛的恐惧可能导致你在关系中筑起高墙。事业上你的深度和战略思维是优势，但对权力的执念是陷阱。当你学会在适当的时候放手，转化才真正开始。",
    "8": "土星射手：你此生的核心课题是将乐观转化为纪律，将信念转化为行动。过度乐观和逃避现实是你需要注意的倾向。事业上适合教育和国际领域，但需要建立持续的行动框架。真正的自由不是随心所欲，而是在约束中找到意义。",
    "9": "土星摩羯：土星入庙——责任、成就和纪律是你此生最重要的课题和最大的力量来源。你天生懂得延迟满足和长远规划。事业上的成就驱动力极强，但也容易成为工作狂。学会在奋斗和享受之间找到平衡，是土星摩羯一生的功课。",
    "10": "土星水瓶：你此生的核心课题是在独立与合作之间找到平衡。情感疏离和过度理性化是你需要突破的模式。事业上你的创新思维是优势，但需要学会与他人协作。真正的独立不意味着排斥连接，而是在连接中保持自我。",
    "11": "土星双鱼：你此生的核心课题是建立界限和面对现实。逃避痛苦的倾向是你需要觉察的模式。事业上艺术和灵性天赋是优势，但需要建立实际的行动框架来承载你的梦想。当你学会在柔软中保持坚定，你的慈悲将成为真正的力量而非负担。"
  },
  "Uranus": {
    "0": "天王星白羊（世代的先锋）：你具有打破传统、独立行动的强大冲动。你对个人自由的需求超越一切。在事业上你是天生的创业者和改革者。爱情中你需要一个不被规则束缚的关系模式，传统婚姻框架可能让你感到窒息。",
    "1": "天王星金牛（世代的变革者）：你对物质世界和价值观有颠覆性的看法。可能经历财务上的大起大落或完全不同的赚钱方式。你这一代人将重塑金融体系和人与自然的关系。个人层面上，你对美的追求也不同寻常。",
    "2": "天王星双子（新一代的沟通者）：信息处理和传播方式将被彻底颠覆。你具有高度原创的思维方式，对新技术和新媒体有天生的敏感。社交圈多元且变化快。学习方式打破常规——你可能同时是多个领域的深度爱好者。",
    "3": "天王星巨蟹（情感的革命者）：你对家庭、安全感和情感表达的定义与上一代人截然不同。非传统的家庭结构、远程家庭关系、情感科技的应用都是你这一代带来的变革。个人层面上，你的情绪表达方式独特且不可预测。",
    "4": "天王星狮子（创造力的解放者）：自我表达和创造力的形式被彻底颠覆。你不满足于传统的舞台和认可方式。你这一代人带来了全新的艺术形式和领导力概念。爱情中的自我展示方式也不同寻常——你的个人魅力与众不同。",
    "5": "天王星处女（工作的革命者）：工作方式、健康观念和日常秩序正在被颠覆。你这一代人推动了远程工作和数字健康的发展。个人层面上，你的工作流程和健康习惯可能与主流完全不同。对完美的定义也在发生变化。",
    "6": "天王星天秤（关系的革命者）：婚姻、合作和社会关系的定义正在被彻底改写。你这一代人正在创造全新的关系模式和社会契约。个人层面上，你在合作关系和伴侣关系中需要充分的自由度和灵活性。",
    "7": "天王星天蝎（转化的加速器）：深度转化、权力结构和性的观念正在经历革命。你具有极强的直觉和突破禁忌的冲动。金融体系的变革和资源再分配是你这一代的核心议题。个人层面上，你的转化经历往往是突然而剧烈的。",
    "8": "天王星射手（信仰的革命者）：教育、宗教和旅行的形式正在被颠覆。你这一代人带来了全新的哲学体系和跨文化理解方式。个人层面上，你的信念系统可能经历多次突然的转向——每次转向都是一次觉醒。",
    "9": "天王星摩羯（权威的重塑者）：社会结构、政府和企业正在被根本性地改变。你这一代人将挑战和重建权威的形式。事业上的路径可能充满突然的转折——被裁员后创业、或在传统行业中引入颠覆性的模式。",
    "10": "天王星水瓶（极致的天王星）：这是天王星最强大的位置之一。你具有极强的独立精神和前瞻性思维，对集体未来有深刻的直觉。科技创新和社会变革是你此生的核心主题。人际关系的模式高度个性化且不按常理。",
    "11": "天王星双鱼（灵性的革命者）：灵性、艺术和集体潜意识的领域正在经历彻底的变革。你这一代人带来了全新的疗愈方式和灵性实践。个人层面上，你的直觉和灵性体验可能突然开启，以不寻常的方式与世界进行灵魂层面的连接。"
  },
  "Neptune": {
    "0": "海王星白羊（梦想的先锋）：你这一代人将灵性和理想主义注入了行动和开创精神之中。个人层面上，你对梦想的追求具有不寻常的勇气，但也需要警惕冲动投入虚幻的目标。学会区分直觉和一时冲动的幻想是你的功课。",
    "1": "海王星金牛（物质与灵性的融合）：你这一代人正在重新定义物质与精神的关系——金钱、自然、身体都可以是灵性的载体。个人层面上，你对财务和感官享受可能有理想化的倾向。财运上直觉敏锐，但需警惕不切实际的投资幻想。",
    "2": "海王星双子（信息的灵性化）：你这一代人沟通和获取信息的方式被灵感和直觉渗透。思维不再仅仅是线性和逻辑的。个人层面上，你的表达具有诗意和感染力，但可能缺乏精确性。学会在灵感与逻辑之间找到平衡。",
    "3": "海王星巨蟹（情感的海洋）：家庭、根源和情感安全被赋予了近乎神秘的色彩。你这一代人对「家」的定义更加流动和具有灵性维度。个人层面上，你对情感安全的需求与对超越家庭束缚的渴望之间存在张力。",
    "4": "海王星狮子（创造力的神性）：自我表达与灵性融合。你这一代人将艺术创作视为灵性实践，将浪漫爱情视为超越自我边界的途径。个人层面上，你在感情中容易将对方理想化——爱人是你灵魂的镜子。创造力的迸发来自灵感的降临。",
    "5": "海王星处女（日常的神圣）：工作、服务和健康被赋予了灵性维度。你这一代人将重新定义「服务」的意义——不仅是完成任务，更是灵魂的奉献。个人层面上，你可能对完美的追求带有不切实际的色彩，需警惕因过度付出而耗竭。",
    "6": "海王星天秤（关系的幻象与理想）：你对伴侣关系和美的追求带有理想化的色彩。你这一代人正在重新定义爱与公平的含义。个人层面上，你容易在关系中将对方过度美化——当幻象褪去时可能感到失望。学会在理想与真实之间找到和谐。",
    "7": "海王星天蝎（深度的迷幻）：潜意识、性和转化的领域被海王星的神秘力量渗透。你这一代人具有极强的灵性穿透力。个人层面上，你的直觉极强但可能被幻觉干扰。财运上需警惕与他人资源的模糊纠缠。灵魂层面的转化是你的道路。",
    "8": "海王星射手（信仰的迷雾与光芒）：信仰、真理和远方的追求被灵性化。你这一代人将重塑宗教和哲学的面貌。个人层面上，你可能在寻找「终极真理」的过程中经历多次幻灭和重生。旅行不只是地理的，更是灵魂的朝圣。",
    "9": "海王星摩羯（体制的溶解）：社会结构和权威形象正在被灵性力量悄悄溶解。你这一代人重新定义了成功和成就的含义。个人层面上，你可能在世俗成功和精神追求之间感到拉扯——真正的成就也许不是爬到塔顶，而是让塔本身变得不再重要。",
    "10": "海王星水瓶（集体的梦想）：社群、科技和人道主义被赋予了灵性使命。你这一代人将科技视为连接集体意识的工具。个人层面上，你的理想主义与社会变革紧密相连。需警惕在宏大的愿景中忽视个人情感的现实需求。",
    "11": "海王星双鱼（回归源头）：这是海王星最强的位置——灵性、艺术和集体慈悲达到顶峰。你这一代人拥有最强的共情能力和灵性天赋。个人层面上，边界感是你此生最大的课题。你的敏感是一份礼物，但首先你要学会保护自己的能量场。"
  },
  "Pluto": {
    "0": "冥王星白羊（权力的新生）：你这一代将彻底重塑权力的定义——从控制转向赋权。个人层面上，你对自己的身份和意志力有近乎强迫的执着。你的人生中可能经历多次身份的彻底重组。行动力中蕴含着深沉的推动力。",
    "1": "冥王星金牛（资源的掌控）：价值观、资源和物质世界正在经历根本性的转化。你这一代人将重塑经济体系和人与自然的关系。个人层面上，你对财务的掌控欲需要被觉察。真正的财富不是占有，而是智慧和资源的流动。",
    "2": "冥王星双子（思想的重塑）：信息、沟通和思维模式正在被彻底改变。你具有极强的思维穿透力，能看穿表层的信息直达本质。你对知识的追求带有痴迷的色彩——一旦对某件事产生兴趣，你会深入到无人之境。",
    "3": "冥王星巨蟹（情感的深渊）：家庭、根源和情感安全正在经历深度的重组。你这一代人对「家」和「归属感」的定义将被彻底改变。个人层面上，你与母亲或家庭之间可能存在着深刻的——有时是挑战性的——灵魂连接。",
    "4": "冥王星狮子（创造力的涅槃）：自我表达、创造力和爱的本质正在经历彻底的转化。你这一代人将重新定义「被看见」的方式。个人层面上，你的创造力来自最深的情感深渊——每一次创作都是一次灵魂的再生。",
    "5": "冥王星处女（日常的深度）：工作、健康和服务的意义正在被彻底重新定义。你具有穿透日常表层看见本质的能力。在工作中有强迫性的完美主义倾向——这是天赋也是陷阱。你的身体是你灵魂转化的重要场域。",
    "6": "冥王星天秤（关系的炼金术）：婚姻、合作和社会契约正在经历根本性的重塑。你这一代人对关系中的权力平衡极为敏感。个人层面上，你的亲密关系是你最深转化的催化剂——每一次重要的关系都是一次灵魂的黑暗之旅与重生。",
    "7": "冥王星天蝎（极致的冥王星）：这是冥王星最强大的位置。你具有穿透一切表象的洞察力和惊人的再生能力。转化是你生命的核心主题——你不会在舒适区停留太久。对真相和深度的追求近乎偏执。你的存在本身就是对周围人的转化催化剂。",
    "8": "冥王星射手（信仰的涅槃）：信仰体系、教育和生命意义正在经历彻底的瓦解与重建。你可能经历多次精神上的「死亡与重生」——旧的信念被摧毁，新的理解从中升起。你这一代人将重塑教育和精神追求的方式。",
    "9": "冥王星摩羯（体制的瓦解与重建）：社会结构、政府和企业正在经历最根本的权力重组。你这一代人的使命是摧毁已经腐朽的旧体系，并在废墟上建立新的秩序。个人事业上，你可能经历一次或多次彻底的职业转型——这不是失败，而是灵魂的必经之路。",
    "10": "冥王星水瓶（未来的权力）：社群、科技和集体意识正在被彻底重塑。你这一代人是数字时代真正的权力玩家。个人层面上，你对集体变革有深刻的直觉。你的人道主义情怀带有一种不动摇的力量——你不是仅仅梦想更好的世界，你有意志力去实现它。",
    "11": "冥王星双鱼（灵魂的暗夜与黎明）：灵性、慈悲和集体潜意识的领域正在经历最深层的清洗和重生。你这一代人承担着消化集体业力的使命。个人层面上，你的敏感度极高，可能会有激烈的灵性体验或深度的创作冲动。保护能量边界是你的必修课。"
  }
};

// ── PLANET_SIGN_EN ────────────────────────────────────────────────────
const PLANET_SIGN_EN = {
  "Sun": {
    "0": "Sun in Aries gives you a pioneer's soul — brave, direct, and full of vitality. You don't like waiting and resist being bound by rules; you are a natural trailblazer. In career, you thrive in entrepreneurship or fields requiring quick decisions. In love, you are passionate and proactive, but need to learn to listen patiently to your partner. Your life lesson is turning impulse into lasting achievement.",
    "1": "Sun in Taurus endows you with earth-like steadiness and resilience. You value material security and sensory pleasure, with natural judgment for beauty and wealth. Earning money is a core way you build security, and your financial instincts are usually strong. In love, you are loyal and enduring but can be possessive. Beware of missing opportunities for change in pursuit of excessive stability.",
    "2": "Sun in Gemini gives you tireless curiosity and an agile mind. You excel at gathering information and connecting people — a born communicator. Career-wise, you thrive in media, education, sales, and other diverse fields. In love, you need intellectual chemistry and constant conversation; your partner must keep up with the speed of your mind. Your biggest lesson is learning focus and depth.",
    "3": "Sun in Cancer places emotion and security at the center of your life. Family, roots, and intimate relationships are your sources of strength. You have a natural gift for nurturing others and excel in caregiving professions. In love, you are gentle and devoted but guarded — you need your partner to prove their loyalty and reliability first. Financial decisions are often swayed by emotion; building a rational framework helps.",
    "4": "Sun in Leo gives you natural stage presence and creative flair. You crave to be seen and recognized, and deep down believe you are destined for something remarkable. You thrive in leadership roles and creative industries. In love, you are passionate and romantic, needing admiration and praise from your partner. Financially, you earn boldly and spend generously — learning to save and plan is essential. Your life lesson is balancing confidence with humility.",
    "5": "Sun in Virgo makes you pursue perfection and order. You possess precise analytical ability and a service-oriented spirit, meticulous in everything you do. Career-wise, you excel in fields requiring professional depth — technology, healthcare, research. In love, your expression is restrained and practical; you prove love through actions, not words. Financially prudent, but may miss opportunities through excessive caution. Learning to accept imperfection is your growth path.",
    "6": "Sun in Libra endows you with graceful social skills and fair judgment. You naturally pursue harmony and balance, excelling at cooperation and diplomacy. Career-wise, law, PR, design — any field requiring aesthetics and coordination — suits you well. Love is one of the most important themes in your life — you need relationships to see yourself clearly. Decision-making can be a struggle; overcoming indecision is key.",
    "7": "Sun in Scorpio gives you X-ray insight and astonishing willpower. You're not satisfied with surface answers and are always probing for truth and depth. Career-wise, research, psychology, finance — fields requiring penetration — fit you well. In love, you invest completely; you love and hate intensely, and betrayal is the hardest thing to forgive. Financially gifted with investment vision, but avoid betting everything on one obsession.",
    "8": "Sun in Sagittarius gives you a soul forever on the road. You love freedom, adventure, and philosophical exploration — the meaning of life lies in constantly expanding your horizons. Career-wise, education, publishing, international affairs suit you. In love, you resist being tied down and need a partner who will explore the world with you. Financially optimistic — sometimes too optimistic; building risk awareness is important.",
    "9": "Sun in Capricorn makes you an old soul from a young age, shouldering responsibility early. You are goal-oriented, determined, with patience and endurance far beyond your peers. Career-wise, you have strong ambition and execution ability, suited for management and leadership. In love, you are restrained and responsible, expressing love through achievement rather than words. Financially skilled at long-term planning, but learn to enjoy the journey, not just the result.",
    "10": "Sun in Aquarius gives you independent, forward-thinking ideas and humanitarian spirit. You are naturally different and don't play by the rules. Career-wise, technology, community, innovation fields suit you. In love, you need spiritual resonance and ample personal space — traditional relationship models may not fit you. Financially, income often comes from unique sources but can be unstable. Finding balance between independence and collaboration is your life lesson.",
    "11": "Sun in Pisces gives you boundless compassion and rich imagination. Your soul is soft and profound, naturally versed in art and spirituality. Career-wise, art, healing, charity — work requiring empathy — suits you. In love, you are romantic and dreamy, easily losing self-boundaries in relationships. Financially, your intuition is sharp, but you need practical money management habits. Your practice in this life is building containers for your dreams in the material world."
  },
  "Moon": {
    "0": "Moon in Aries makes your emotional expression direct and passionate. A warrior lives inside you, needing constant new stimulation to keep emotional vitality alive. In intimate relationships, you react quickly but lack patience — easily erupting over small things and forgetting just as fast. Your emotional security comes from 'action' — when unsettled, you instinctively want to do something.",
    "1": "Moon in Taurus gives you the most stable emotional foundation. You need material security and sensory comfort to soothe your heart — good food, beautiful things, a stable living environment are the cornerstones of your emotional health. In relationships, your loyalty is extremely high, but once hurt, recovery is slow. Financial security directly affects your emotional state — your bank balance is the barometer of your inner peace.",
    "2": "Moon in Gemini makes your emotional needs changeable and centered on intellectual stimulation. You need constant information exchange and fresh experiences for emotional satisfaction. Forever young at heart, witty and articulate, but may struggle to settle emotionally due to an overactive mind. Your partner must be able to spar with you intellectually, or you'll grow bored.",
    "3": "Moon in Cancer is the Moon's most natural position — rich in emotion, strong in intuition, deeply valuing family and intimate relationships. Your emotions ebb and flow like tides, and you easily absorb the feelings of those around you. In love, you are a natural caregiver, but also need to be tenderly cared for. Emotional security is the foundation of your life — when it's shaken, everything is affected.",
    "4": "Moon in Leo makes your heart crave praise and admiration. Your emotional expression is dramatic and passionate; you need absolute loyalty and sustained attention from your partner. Self-esteem is the core of your emotional health — when you feel overlooked or undervalued, you become highly sensitive. Creative self-expression and shining on stage are vital sources of emotional nourishment.",
    "5": "Moon in Virgo makes your emotional expression restrained and cautious. You express love through service and care for others, pursuing perfection inwardly but prone to worry and anxiety. In love, you hold both yourself and your partner to high standards, which can create tension. Building healthy daily routines and order is your emotional stabilizer.",
    "6": "Moon in Libra endows you with a deep longing for harmonious relationships. You fear conflict and loneliness, needing a partner's companionship for emotional fulfillment. Beneath an elegant, gentle exterior, you are acutely sensitive to imbalance in relationships. Aesthetics and beautiful things are important for emotional regulation. Learning to balance pleasing others with caring for yourself is a key lesson.",
    "7": "Moon in Scorpio makes your emotional world as deep and intense as the ocean. You love and hate distinctly, hiding enormous emotional energy and intuition within. You need absolute trust and soul-level fusion — superficial relationships cannot satisfy you. You have remarkable emotional regenerative ability — every emotional crisis is an opportunity for transformation.",
    "8": "Moon in Sagittarius makes your emotional expression optimistic and cheerful. Your heart is full of longing for distant places and the search for life's meaning, disliking being trapped by trivial routines. You need a partner who will grow and explore with you — anyone who limits your freedom makes you instinctively flee. Travel, learning, and philosophy are how you recharge emotionally.",
    "9": "Moon in Capricorn makes your emotional expression restrained and reserved. You value responsibility and commitment, expressing love through actions rather than words. Strong inside but not one to show it easily — your emotional management ability is an advantage in the workplace. But in intimate relationships, you need to learn to allow yourself to be vulnerable — not everything needs to be carried alone.",
    "10": "Moon in Aquarius gives you an independent, rational emotional pattern. You need spiritual resonance and ample personal space — traditional emotional dependency models may feel suffocating. You care about humanity more than individuals; idealism and community consciousness are important parts of your emotional world. Emotional distance is your way of protecting yourself, but it can also become a source of loneliness.",
    "11": "Moon in Pisces gives you boundless empathy and a rich inner world. Your emotional sensitivity is extremely high — you can sense what others haven't said out loud. Art and spirituality are vital sources of emotional nourishment. In love, you easily lose self-boundaries, taking on your partner's issues as your own. What you need to build is not thicker walls, but clearer boundaries."
  },
  "Mercury": {
    "0": "Mercury in Aries makes your thinking and expression direct and rapid. You don't beat around the bush — you say what you think. Quick to learn but lacking patience, suited for pioneering thinking and fast-paced information processing. In negotiation or debate, you can be a sharp opponent, but watch out for hurting relationships by speaking too bluntly.",
    "1": "Mercury in Taurus makes your thinking steady and pragmatic. You don't learn fast, but once you understand something, it's deeply rooted. Your expression is gentle yet persuasive, valuing practical experience over abstract theory. You have a natural gift for financial decisions and long-term planning. Your communication style is conservative — you dislike meaningless small talk.",
    "2": "Mercury in Gemini is Mercury's most active position — quick-witted, eloquent, processing information at lightning speed. You are naturally suited for writing, teaching, media, sales — any work requiring communication skills. Curiosity drives you to constantly learn new things, but you may skim the surface. Your mind needs to find balance between breadth and depth.",
    "3": "Mercury in Cancer makes your thinking deeply influenced by emotion and memory. Your memory is extremely strong, especially for information tied to emotional experiences. Intuitive thinking lets you pick up on messages beyond words. Your communication style is warm and empathetic, suited for fields requiring emotional intelligence. But be careful not to let emotions completely dominate your judgment.",
    "4": "Mercury in Leo gives you a creative and dramatic way of expressing yourself. You excel at big-picture thinking and storytelling, with a gift for packaging complex ideas in compelling ways. Suited for leadership communication, creative planning, public speaking. You may have little patience for details — cultivate team members who can help ground your ideas.",
    "5": "Mercury in Virgo is one of Mercury's strongest positions — outstanding analytical ability, rigorous and meticulous thinking. You excel at categorizing, organizing, and optimizing information — a natural editor, analyst, or technical expert. You pursue precision and efficiency in work. But excessive perfectionism may trap you in analysis paralysis, unable to make a final decision.",
    "6": "Mercury in Libra makes you skilled at seeing issues from multiple angles. Your expression is elegant and tactful — a natural diplomat and negotiator. You pursue harmony and fairness in thinking, able to stand in a neutral position and mediate between parties. Suited for law, PR, consulting. Decision-making may involve hesitation — you need to trust your own judgment.",
    "7": "Mercury in Scorpio gives you the ability to see through surfaces. You're not satisfied with shallow information and excel at digging up truth and hidden motives. Suited for research, investigation, psychological analysis — work requiring depth. Your expression is brief but powerful; you don't say much, but every word lands. Keeping secrets is your gift, but be careful not to become paranoid and suspicious of everything.",
    "8": "Mercury in Sagittarius makes your thinking broad and optimistic. You love exploring philosophy, religion, culture — macro topics. The thirst for knowledge drives you to constantly journey — whether physically or mentally. Your learning style is leap-based; you grasp the big picture well but are impatient with details. Suited for education, publishing, international affairs.",
    "9": "Mercury in Capricorn makes your thinking rigorous and pragmatic, with strong logic and structure. Your learning style is step-by-step, suited for fields requiring long-term accumulation and systematic planning. Your expression is concise and efficient — no wasted words. Natural advantages in business, management, engineering — fields needing precise thinking and long-term planning.",
    "10": "Mercury in Aquarius makes your thinking unique and avant-garde. You don't follow conventional patterns and often have unexpected insights and innovative ideas. Suited for technology, invention, social innovation — fields requiring forward-thinking. You care about human progress and social issues, skilled at spotting future trends. Your communication style can be somewhat detached — in intimate communication, pay attention to emotional warmth.",
    "11": "Mercury in Pisces gives you poetic and intuitive thinking. Your mind doesn't operate in linear logic but through images, feelings, and associations. Suited for artistic creation, music, spiritual healing. Your expressive ability may not be as clear as other placements, but the emotion and atmosphere you convey are unmatched. Everyday logical expression needs deliberate practice."
  },
  "Venus": {
    "0": "Venus in Aries makes you proactive and passionate in love. You enjoy the thrill of pursuit and conquest — passive waiting is not your style. Your aesthetic is bold and direct, liking vivid colors and styles. In love, you need novelty and challenge, but watch out for impulsiveness and a tendency to lose interest quickly. Financially decisive but needs better planning.",
    "1": "Venus in Taurus is Venus's most comfortable position — you are loyal and stable in love, valuing sensory pleasure and material foundation. You like natural, comfortable aesthetics, with natural judgment for quality. Slow to warm up in love but enduring — once your heart is given, it's unwavering. Financially, you have an instinct for accumulating wealth, with good intuition for investment and value preservation.",
    "2": "Venus in Gemini makes you pursue intellectual exchange and variety in love. Your charm comes from witty conversation and never-ending curiosity. Easily attracted to intelligent, interesting people, with diverse and ever-changing aesthetics. In love, you need continuous fresh stimulation, but this may make long-term commitment difficult. Suited for work centered on communication and social interaction.",
    "3": "Venus in Cancer makes you deeply value emotional security in love. You are gentle and caring, naturally knowing how to make your partner feel cherished and looked after. You like creating a warm home atmosphere, nostalgic with maternal radiance. In love, you tend to build protective shells for fear of getting hurt, needing your partner to prove loyalty first. Financially inclined toward saving and conservative investment.",
    "4": "Venus in Leo makes you passionate, romantic, and radiant in love. You like being pursued and admired, and the love you give is equally generous and dramatic. Your aesthetic is glamorous — you like styles that help you stand out in a crowd. You need sustained attention and recognition from your partner. Financially ambitious and charismatic for earning big, but also quite generous in spending.",
    "5": "Venus in Virgo makes you restrained and rational in love. You express love through practical actions rather than flowery words — doing things, solving problems, providing practical help for your loved one. Your aesthetic is minimalist and refined, valuing detail and quality over quantity. In love, you have high standards for your partner, sometimes too critical. Financially meticulous, skilled at finding great value.",
    "6": "Venus in Libra is Venus's strongest position — you are naturally versed in the art of love and beauty. You pursue harmonious, balanced relationships and are skilled at maintaining equilibrium in love. Your aesthetic is elegant and classic, with outstanding taste. You fear being alone and tend to over-compromise in relationships to maintain harmony. Financially, you may spend more pursuing quality of life, but your social resources often bring returns.",
    "7": "Venus in Scorpio makes you invest completely in love, craving soul-deep connection. Possessive yet loyal — once you fall in love, it's unforgettable. Your aesthetic is mysterious and sensual, drawn to people and things with depth and stories. In love, you don't easily forgive betrayal. Financially gifted at investing, able to spot undervalued opportunities, but avoid losses from obsession.",
    "8": "Venus in Sagittarius makes you optimistic, open, and freedom-loving in love. You enjoy cross-cultural romance and are easily attracted to people from different backgrounds. Your aesthetic is free-spirited, loving exotic cultures and adventure. In love, you dislike being confined and need a partner who accepts your independence. Financially, good luck often comes but planning is lacking — find balance between optimism and pragmatism.",
    "9": "Venus in Capricorn makes you cautious and serious in love. You don't fall easily, but once committed, you take the relationship seriously and accept responsibility. Your aesthetic is classic and understated, valuing quality and lasting value over trends. In love, you may appear somewhat cool and practical, but you express love through loyalty and concrete actions. Financially, you have strong long-term accumulation and investment planning ability.",
    "10": "Venus in Aquarius makes you independent and free in love, not bound by convention. You don't need traditional relationship models — spiritual resonance and personal space matter more than romantic rituals. Your aesthetic is avant-garde and unique, drawn to experimental and unconventional styles. What attracts people to you is precisely your uniqueness. Financially, income may come from community, internet, or innovative fields.",
    "11": "Venus in Pisces is Venus's highest expression — you are romantic, dreamy, and have unconditional compassion in love. Love for you is the merging of souls, not the exchange of material things. Your aesthetic is rich with artistic and spiritual qualities. Easily drawn to those in need of help; in love, be mindful of self-protection. Financially intuitive, but need to build practical money management habits."
  },
  "Mars": {
    "0": "Mars in Aries is Mars's strongest position — explosive drive, extremely competitive. You react quickly to challenges and are a natural pioneer and leader. Your action style is direct and bold, but endurance is limited; you may lose patience with long-term projects. Natural advantages in career, sports, and fields requiring quick decisions. Passionate and proactive in love, needing outlets to release energy.",
    "1": "Mars in Taurus makes your action steady and persistent. Slow to start, but once begun, unwavering. Your endurance is remarkable, suited for fields requiring long-term persistence to see results. The pursuit of material and sensory experiences drives your actions. In love, your desires are deep and sustained, but you may appear overly stubborn or possessive.",
    "2": "Mars in Gemini makes your action style flexible and changeable. You excel at multitasking, with scattered but efficient energy. Communication, writing, travel, and intellectual challenges are your main channels for releasing energy. You shine in situations requiring quick reaction and adaptability. In love, you need intellectual stimulation and continuous conversation to maintain passion.",
    "3": "Mars in Cancer makes your actions driven by emotion and protective instincts. You are most courageous when fighting for family and loved ones. Your drive is intermittent — capable of anything when emotionally high, needing a safe harbor when low. You have strong guardian instincts, but in the workplace, emotions sometimes affect consistency of action.",
    "4": "Mars in Leo gives you a dramatic action style and leadership charisma. You need recognition and appreciation to stay motivated, naturally gravitating toward leadership positions in teams. Your actions have a performative quality — you perform best when in the spotlight. In love, passionate and generous, but be careful not to replace care with domination.",
    "5": "Mars in Virgo makes your actions precise and efficient. You excel at making detailed plans and executing them rigorously — perfectionism is your driving force. You shine in work requiring precision, craftsmanship, and analytical ability. In love, you express love through acts of service — solving problems for your loved one is your romance. Beware of excessive self-criticism undermining your drive.",
    "6": "Mars in Libra makes you value fairness and collaboration in action. You don't like charging ahead alone and are better at mobilizing team strength. Your decision-making involves weighing all sides, making you a fair leader but sometimes slow to act due to over-deliberation. In love and partnerships, you need a partner to perform at your best.",
    "7": "Mars in Scorpio gives you extreme willpower and lasting combat strength. Silent but stunning — you don't need to constantly display your power, but your explosive force in critical moments is astonishing. Strategic thinking makes you suited for fields requiring depth and resilience. In love, your sexual magnetism is strong and desires run deep. Your reaction to betrayal is devastating.",
    "8": "Mars in Sagittarius fills your actions with enthusiasm and adventurous spirit. You love sports, travel, and outdoor challenges — an optimistic, positive attitude is your greatest driver. Your actions aim to constantly expand horizons and gain new experiences. You perform best in causes requiring passion and belief. In love, you pursue freedom and shared adventure, disliking being bound by daily trivialities.",
    "9": "Mars in Capricorn makes your actions planned, disciplined, and goal-oriented. Your execution is extremely strong — once the direction is set, you push forward unwaveringly. Achievement orientation drives every step. In the workplace, you are a reliable force, but may appear too serious. In love, you express love through practical actions — better at providing substantial support than romantic words.",
    "10": "Mars in Aquarius gives you a uniquely free-spirited action style. You act at your own pace and in your own way, unbound by tradition and authority. Your drive focuses on reform, innovation, and collective causes. You perform best in fields requiring breakthrough from convention. In love, you need ample freedom and space — traditional relationship rules are not mandatory for you.",
    "11": "Mars in Pisces makes your actions driven by intuition and inspiration. Apparently soft but truly resilient — your action style is water-like in adaptability. Artistic creation, spiritual practice, and helping others are your main channels for releasing energy. Unique advantages in fields requiring empathy and imagination. You may not be the most execution-oriented placement, but your actions carry profound emotional resonance."
  },
  "Jupiter": {
    "0": "Jupiter in Aries helps you grow through courage, adventure, and competition. Your good fortune comes from daring to decide quickly and being at the forefront. Career-wise, pioneering roles suit you; romance is likely to bloom in competitive or sports settings. Financial opportunities tend to arrive when you take the initiative — waiting is not your lucky strategy.",
    "1": "Jupiter in Taurus helps you grow through accumulation, patience, and practical judgment. Wealth luck is the most prominent gift of this placement — you don't chase quick money, but steady long-term financial growth is your hallmark. In love, luck comes from stability and sincere devotion. Your blessings often manifest in slow, certain processes.",
    "2": "Jupiter in Gemini helps you gain opportunities through information, learning, and networks. Your eloquence and sensitivity to information are the greatest wealth catalysts. Career-wise, diversified development suits you; romance comes through social occasions and intellectual exchange. Financial opportunities often appear when you least expect them, through friends or new information.",
    "3": "Jupiter in Cancer helps you grow through emotional connection and family nourishment. Luck comes from intuition and sensitivity to others' needs — the warmth you give always flows back in some form. Family and property often bring blessings. In love, good fortune comes from your willingness to care for both your own and others' emotional needs.",
    "4": "Jupiter in Leo helps you expand through creative self-expression and leadership. Your confidence and stage presence are the greatest wealth catalysts. Career-wise, opportunities to be seen and recognized far exceed the average. Romance luck is abundant — you carry a halo wherever you go. Financial opportunities come from your personal brand and influence.",
    "5": "Jupiter in Virgo helps you grow through service, meticulous work, and continuously improving professional skills. Your luck lies in doing things right, in detail, and to the utmost. Professional reputation is the most reliable source of wealth. In love, good fortune comes from sincere devotion and a humble attitude — you receive the most when you least demand it.",
    "6": "Jupiter in Libra helps you gain opportunities through cooperation, diplomacy, and interpersonal balance. Good partners and collaborators are your greatest source of luck. Career-wise, fields requiring negotiation and aesthetics suit you. Romance is strongest in social and artistic settings. Financial opportunities often arrive through partnerships and networks.",
    "7": "Jupiter in Scorpio helps you grow through deep transformation, resource integration, and strategic investment. Your investment vision and resource management ability are the greatest wealth gifts. Career success comes from deep expertise and strategic thinking. In love, luck comes from your willingness to face your shadow and undergo profound self-transformation.",
    "8": "Jupiter in Sagittarius is Jupiter's strongest position — unlimited expansion through travel, higher education, philosophical exploration, and cross-cultural experience. Your open mindset and passion for life are the greatest wealth. Career-wise, international and educational fields suit you. Romance is strongest during travel and study. Financial opportunities often carry an international or cross-cultural flavor.",
    "9": "Jupiter in Capricorn helps you grow through effort, discipline, and long-term planning. Though Jupiter is less comfortable here, your luck lies in persistent dedication — you're still going when others have given up. Social status in your career is the greatest source of wealth. Financial security comes from long-term planning and stable career advancement.",
    "10": "Jupiter in Aquarius helps you expand through innovation, community engagement, and forward-looking vision. Your unique thinking and humanitarian spirit are the greatest wealth catalysts. Career-wise, technology, community, and innovation fields suit you. Romance quietly blossoms in community and shared causes. Financial opportunities come from unconventional channels and like-minded groups.",
    "11": "Jupiter in Pisces helps you grow through spirituality, art, and compassion. Your intuition and imagination are the greatest sources of wealth. Career-wise, art, healing, and charity suit you. In love, good fortune comes from your unconditional love and empathy. Financially, you need to find balance between idealism and practical management."
  },
  "Saturn": {
    "0": "Saturn in Aries: Your core life lesson is learning patience and strategic action. You are asked to transform Aries impulsiveness into sustained effort and orderly progress. In career, only through discipline can leadership potential become actual achievement. In love, learn to find balance between self-assertion and compromise.",
    "1": "Saturn in Taurus: Your core life lesson is building healthy values and self-worth. Excessive attachment to material security needs examination. Career-wise, steady gradual ascent suits you — high-risk operations are not your path. Finances are a key area of growth for you — not about earning ability, but your psychological relationship with money.",
    "2": "Saturn in Gemini: Your core life lesson is learning focus and depth of thought. Information fragmentation and superficial dabbling are patterns you easily fall into. Career-wise, you need to choose one field and go deep rather than constantly switching directions. Communication is both your gift and your lesson — learning when silence is equally important.",
    "3": "Saturn in Cancer: Your core life lesson is establishing emotional boundaries and a foundation of inner security. You tend to take on emotional responsibilities beyond your capacity. In career, emotional intelligence is your advantage, but guard against being submerged by others' needs. Learning to balance caring for others with protecting yourself is your most important life lesson.",
    "4": "Saturn in Leo: Your core life lesson is transforming self-expression into genuine creation and service. You are asked to move from 'being seen' to 'illuminating others.' Leadership in career needs to be earned through humility and sustained effort. In love, learn that love is not demanding attention but offering sincere recognition.",
    "5": "Saturn in Virgo: Your core life lesson is accepting imperfection and practicing self-compassion. Excessive criticism and perfectionism are your heaviest burdens. In career, your professional ability is extremely strong, but anxiety may hinder your performance. In love, learn that the essence of relationships is growth, not perfection. When you stop harshly judging yourself, the world becomes gentler too.",
    "6": "Saturn in Libra: Your core life lesson is learning to establish healthy boundaries and independent decision-making. Over-dependence on others' approval and conflict avoidance are patterns to overcome. In career, your coordination ability is an advantage, but you need to stand firm at critical moments. In love, true intimacy is not merging, but the choice of two whole, independent people.",
    "7": "Saturn in Scorpio: Your core life lesson is learning trust and letting go of control. Fear of betrayal may cause you to build high walls in relationships. In career, your depth and strategic thinking are advantages, but obsession with power is a trap. When you learn to let go at the right moment, true transformation begins.",
    "8": "Saturn in Sagittarius: Your core life lesson is turning optimism into discipline and belief into action. Excessive optimism andescaping reality are tendencies to watch. Career-wise, education and international fields suit you, but you need to build sustainable action frameworks. True freedom is not doing whatever you want, but finding meaning within constraints.",
    "9": "Saturn in Capricorn: Saturn in domicile — responsibility, achievement, and discipline are your most important life lesson and greatest source of strength. You naturally understand delayed gratification and long-term planning. Your career achievement drive is extremely strong, but you may become a workaholic. Learning to find balance between striving and enjoying is a lifelong lesson for Saturn in Capricorn.",
    "10": "Saturn in Aquarius: Your core life lesson is finding balance between independence and collaboration. Emotional detachment and over-rationalization are patterns to break through. In career, your innovative thinking is an advantage, but you need to learn to collaborate with others. True independence doesn't mean rejecting connection — it means staying true to yourself within connection.",
    "11": "Saturn in Pisces: Your core life lesson is establishing boundaries and facing reality. The tendency toescaping pain is a pattern to be aware of. In career, artistic and spiritual gifts are advantages, but you need to build practical action frameworks to hold your dreams. When you learn to stay firm within softness, your compassion becomes true strength rather than burden."
  },
  "Uranus": {
    "0": "Uranus in Aries (Generation Pioneer): You have a powerful impulse to break traditions and act independently. Your need for personal freedom surpasses everything. In career, you are a natural entrepreneur and reformer. In love, you need a relationship model unbound by rules — traditional marriage frameworks may feel suffocating.",
    "1": "Uranus in Taurus (Generation Reformer): You hold revolutionary views on the material world and values. You may experience dramatic financial ups and downs or entirely different ways of earning. Your generation will reshape financial systems and humanity's relationship with nature. On a personal level, your pursuit of beauty is also unconventional.",
    "2": "Uranus in Gemini (New Generation Communicator): Information processing and dissemination methods will berevolutionized. You possess highly original thinking patterns, with natural sensitivity to new technology and media. Your social circles are diverse and rapidly changing. Your learning style breaks conventions — you may be a deep enthusiast in multiple fields simultaneously.",
    "3": "Uranus in Cancer (Emotional Revolutionary): Your definitions of family, security, and emotional expression are vastly different from the previous generation. Unconventional family structures, long-distance family relationships, emotional technology applications — all are changes your generation brings. On a personal level, your emotional expression is unique and unpredictable.",
    "4": "Uranus in Leo (Creativity Liberator): The forms of self-expression and creativity are beingrevolutionized. You are not satisfied with traditional stages and recognition methods. Your generation brings entirely new art forms and concepts of leadership. Your way of presenting yourself in love is also unconventional — your personal magnetism is distinctly different.",
    "5": "Uranus in Virgo (Work Revolutionary): Work methods, health concepts, and daily order are beingrevolutionized. Your generation drove the development of remote work and digital health. On a personal level, your workflow and health habits may be entirely different from the mainstream. The definition of perfection is also changing.",
    "6": "Uranus in Libra (Relationship Revolutionary): The definitions of marriage, cooperation, and social contracts are being fundamentally rewritten. Your generation is creating entirely new relationship models and social contracts. On a personal level, you need ample freedom and flexibility in partnerships and companion relationships.",
    "7": "Uranus in Scorpio (Transformation Accelerator): The realms of deep transformation, power structures, and sexuality are undergoing revolution. You have extremely strong intuition and an impulse to break taboos. Financial system reform and resource redistribution are core themes of your generation. On a personal level, your transformative experiences are often sudden and intense.",
    "8": "Uranus in Sagittarius (Belief Revolutionary): The forms of education, religion, and travel are beingrevolutionized. Your generation brings entirely new philosophical systems and cross-cultural understanding. On a personal level, your belief system may experience multiple sudden turns — each turn is an awakening.",
    "9": "Uranus in Capricorn (Authority Reshaper): Social structures, governments, and corporations are being fundamentally changed. Your generation will challenge and rebuild the forms of authority. Your career path may be full of sudden turns — being laid off then starting a business, or introducingdisruptive models into traditional industries.",
    "10": "Uranus in Aquarius (Ultimate Uranus): This is one of Uranus's most powerful positions. You have an extremely strong independent spirit and forward-thinking mind, with profound intuition about the collective future. Technological innovation and social change are core themes of your life. Your relationship patterns are highly individualized and unconventional.",
    "11": "Uranus in Pisces (Spiritual Revolutionary): The realms of spirituality, art, and the collective unconscious are undergoing the deepest cleansing and rebirth. Your generation brings entirely new healing methods and spiritual practices. On a personal level, your intuition and spiritual experiences may suddenly open, connecting with the world on a soul level in unusual ways."
  },
  "Neptune": {
    "0": "Neptune in Aries (Dream Pioneer): Your generation injects spirituality and idealism into action and pioneering spirit. On a personal level, your pursuit of dreams carries unusual courage, but be vigilant about impulsively investing inillusory goals. Learning to distinguish between intuition and momentaryimpulsive fantasy is your lesson.",
    "1": "Neptune in Taurus (Material-Spiritual Fusion): Your generation is redefining the relationship between material and spirit — money, nature, the body can all be vessels of spirituality. On a personal level, you may idealize finances and sensory pleasures. Financially intuitive but need to guard against unrealistic investment fantasies.",
    "2": "Neptune in Gemini (Spiritualized Information): Your generation's way of communicating and acquiring information is permeated by inspiration and intuition. Thinking is no longer merely linear and logical. On a personal level, your expression has poetic appeal but may lack precision. Learn to balance inspiration with logic.",
    "3": "Neptune in Cancer (Ocean of Emotion): Family, roots, and emotional security are imbued with near-mystical coloring. Your generation's definition of 'home' is more fluid and carries a spiritual dimension. On a personal level, there is tension between your need for emotional security and the longing to transcend family constraints.",
    "4": "Neptune in Leo (Divine Creativity): Self-expression merges with spirituality. Your generation views artistic creation as spiritual practice and romantic love as a path beyond self-boundaries. On a personal level, you tend to idealize your partner in love — the beloved is the mirror of your soul. Creative bursts come from the descent of inspiration.",
    "5": "Neptune in Virgo (Sacred Everyday): Work, service, and health are imbued with spiritual dimension. Your generation will redefine the meaning of 'service' — not just completing tasks, but soul devotion. On a personal level, your pursuit of perfection may carry unrealistic coloring; guard against burnout from excessive giving.",
    "6": "Neptune in Libra (Illusion and Ideal of Relationship): Your pursuit of partnership and beauty carries an idealizing quality. Your generation is redefining the meaning of love and fairness. On a personal level, you tend to over-glamorize your partner in relationships — when the illusion fades, disappointment may follow. Learn to find harmony between ideal and reality.",
    "7": "Neptune in Scorpio (Depth Psychedelia): The realms of the subconscious, sexuality, and transformation are permeated by Neptune's mysterious force. Your generation possesses extremely strong spiritual penetration. On a personal level, your intuition is powerful but may be disturbed by illusions. Financially, be vigilant about unclear entanglements with others' resources. Soul-level transformation is your path.",
    "8": "Neptune in Sagittarius (Mist and Light of Faith): The pursuit of faith, truth, and distant horizons is spiritualized. Your generation will reshape the face of religion and philosophy. On a personal level, you may experience multiple disillusionments and rebirths in the search for 'ultimate truth.' Travel is not just geographical but a pilgrimage of the soul.",
    "9": "Neptune in Capricorn (Dissolution of Institutions): Social structures and authority figures are being quietly dissolved by spiritual forces. Your generation redefines the meaning of success and achievement. On a personal level, you may feel torn between worldly success and spiritual pursuit — perhaps true achievement is not climbing to the top of the tower, but making the tower itself less important.",
    "10": "Neptune in Aquarius (Collective Dream): Community, technology, and humanitarianism are imbued with spiritual mission. Your generation sees technology as a tool for connecting collective consciousness. On a personal level, your idealism is closely tied to social change. Be vigilant about neglecting personal emotional needs in grand visions.",
    "11": "Neptune in Pisces (Return to Source): This is Neptune's strongest position — spirituality, art, and collective compassion reach their peak. Your generation possesses the strongest empathy and spiritual gifts. On a personal level, boundaries are your greatest life lesson. Your sensitivity is a gift, but first you must learn to protect your energy field."
  },
  "Pluto": {
    "0": "Pluto in Aries (Rebirth of Power): Your generation willcompletely reshape the definition of power — from control to empowerment. On a personal level, you have anearly obsessive attachment to your identity and willpower. You may experience multiple complete reorganizations of identity in your life. Your drive carries deep,driving force.",
    "1": "Pluto in Taurus (Mastery of Resources): Values, resources, and the material world are undergoing fundamental transformation. Your generation will reshape economic systems and humanity's relationship with nature. On a personal level, your desire to control finances needs to be examined. True wealth is not possession, but the flow of wisdom and resources.",
    "2": "Pluto in Gemini (Reshaping Thought): Information, communication, and thinking patterns are beingcompletely changed. You have extremely strong mental penetration, able to see through surface information to the essence. Your pursuit of knowledge carries an obsessive quality — once interested in something, you go deeper than anyone.",
    "3": "Pluto in Cancer (Abyss of Emotion): Family, roots, and emotional security are undergoing deep reorganization. Your generation's definition of 'home' and 'belonging' will becompletely changed. On a personal level, you may have a profound — sometimes challenging — soul connection with your mother or family.",
    "4": "Pluto in Leo (Nirvana of Creativity): Self-expression, creativity, and the nature of love are undergoing thorough transformation. Your generation will redefine how to 'be seen.' On a personal level, your creativity comes from the deepest emotional abyss — every act of creation is a soul rebirth.",
    "5": "Pluto in Virgo (Depth of the Everyday): The meaning of work, health, and service is beingcompletely redefined. You have the ability to see through daily surfaces to the essence. At work, there is a compulsive perfectionist tendency — this is both a gift and a trap. Your body is an important field for soul transformation.",
    "6": "Pluto in Libra (Alchemy of Relationship): Marriage, cooperation, and social contracts are undergoing fundamental reshaping. Your generation is extremely sensitive to power balance in relationships. On a personal level, your intimate relationships are the catalyst for your deepest transformation — every significant relationship is a dark journey and rebirth of the soul.",
    "7": "Pluto in Scorpio (Ultimate Pluto): This is Pluto's most powerful position. You possess the insight to see through all surfaces and astonishing regenerative ability. Transformation is the core theme of your life — you won't stay in the comfort zone for long. Your pursuit of truth and depth isnearly obsessive. Your very presence is a catalyst for transformation in those around you.",
    "8": "Pluto in Sagittarius (Nirvana of Faith): Belief systems, education, and life's meaning are undergoing thorough dissolution and reconstruction. You may experience multiple spiritual 'deaths and rebirths' — old beliefs destroyed, new understanding rising from the ashes. Your generation will reshape the way education and spiritual pursuit are approached.",
    "9": "Pluto in Capricorn (Dissolution and Reconstruction of Institutions): Social structures, governments, and corporations are undergoing the most fundamental power reorganization. Your generation's mission is to destroy decayed old systems and build new order on the ruins. In personal career, you may experience one or more thorough professional transformations — this is not failure, but the soul's necessary path.",
    "10": "Pluto in Aquarius (Power of the Future): Community, technology, and collective consciousness are beingcompletely reshaped. Your generation is the true power player of the digital age. On a personal level, you have profound intuition about collective change. Your humanitarian spirit carries an unshakable force — you don't just dream of a better world, you have the willpower to realize it.",
    "11": "Pluto in Pisces (Dark Night and Dawn of the Soul): Spirituality, compassion, and the collective unconscious are undergoing the deepest cleansing and rebirth. Your generation carries the mission of digesting collective karma. On a personal level, your sensitivity is extremely high; you may have intense spiritual experiences or deep creative urges. Protecting your energy boundaries is your required lesson."
  }
};

// ── HOUSE_MEANINGS_EN ─────────────────────────────────────────────────
const HOUSE_MEANINGS_EN = {
  "1": "The 1st House represents self-image, persona, and the first impression you leave on others. Planets here strongly influence your outward temperament and life path.",
  "2": "The 2nd House represents wealth, values, and self-worth. Planets here influence how you earn money and accumulate material resources.",
  "3": "The 3rd House represents communication, learning, siblings, and short trips. Planets here influence your thinking style and information processing.",
  "4": "The 4th House represents home, roots, father, and later life environment. Planets here reveal your family background and inner security.",
  "5": "The 5th House represents creativity, romance, children, and entertainment. Planets here influence your romantic expression and creative self-expression.",
  "6": "The 6th House represents work, health, service, and daily life. Planets here influence your work style and physical condition.",
  "7": "The 7th House represents marriage, partnerships, and open opponents. Planets here reveal your needs in partnership and relationship patterns.",
  "8": "The 8th House represents sex, death, transformation, and others' resources. Planets here influence how you handle deep life issues.",
  "9": "The 9th House represents higher education, philosophy, long-distance travel, and beliefs. Planets here influence your life philosophy and spiritual pursuits.",
  "10": "The 10th House represents career, social status, mother, and life goals. Planets here influence your career direction and social achievements.",
  "11": "The 11th House represents friends, community, hopes, and ideals. Planets here influence your social circles and long-term vision.",
  "12": "The 12th House represents the subconscious, spirituality, hidden matters, and self-dissolution. Planets here reveal your inner spiritual world and karmic lessons."
};

// ── HOUSE_LABELS_EN ───────────────────────────────────────────────────
const HOUSE_LABELS_EN = {
  "1": "Self-Image & Personal Expression",
  "2": "Wealth & Value Affirmation",
  "3": "Communication & Information",
  "4": "Family Roots & Inner Security",
  "5": "Creativity & Romantic Expression",
  "6": "Daily Work & Health Service",
  "7": "Partnership & Win-Win Cooperation",
  "8": "Deep Transformation & Resource Management",
  "9": "Philosophy & Far-Reaching Exploration",
  "10": "Career Achievement & Social Status",
  "11": "Social Circles & Long-Term Vision",
  "12": "Spiritual Practice & Subconscious"
};

// ── SIGN_MEANING_EN ───────────────────────────────────────────────────
const SIGN_MEANING_EN = {
  "0": "Aries is a Fire Cardinal sign, representing new beginnings, primal impulse, and competitive spirit. Its energy is direct and intense.",
  "1": "Taurus is an Earth Fixed sign, representing stability, sensory pleasure, and material accumulation. Its energy is steady and enduring.",
  "2": "Gemini is an Air Mutable sign, representing information, communication, and diversity. Its energy is light and flexible.",
  "3": "Cancer is a Water Cardinal sign, representing emotion, family, and nurturing. Its energy is gentle and profound.",
  "4": "Leo is a Fire Fixed sign, representing creativity, confidence, and expression. Its energy is passionate and radiant.",
  "5": "Virgo is an Earth Mutable sign, representing service, precision, and analysis. Its energy is precise and practical.",
  "6": "Libra is an Air Cardinal sign, representing harmony, beauty, and relationships. Its energy is elegant and balanced.",
  "7": "Scorpio is a Water Fixed sign, representing depth, transformation, and power. Its energy is intense and mysterious.",
  "8": "Sagittarius is a Fire Mutable sign, representing exploration, freedom, and truth. Its energy is optimistic and expansive.",
  "9": "Capricorn is an Earth Cardinal sign, representing achievement, responsibility, and discipline. Its energy is serious and resilient.",
  "10": "Aquarius is an Air Fixed sign, representing innovation, independence, and universal love. Its energy is avant-garde and rational.",
  "11": "Pisces is a Water Mutable sign, representing compassion, spirituality, and merging. Its energy is soft and boundless."
};

// ── SYNASTRY_ASPECTS_EN ───────────────────────────────────────────────
const SYNASTRY_ASPECTS_EN = {
  "Sun_Moon": {
    "good": "There is natural resonance between you on the emotional and will levels. The Sun person's self-expression nourishes the Moon person's emotional needs — a classic marriage aspect.",
    "hard": "Your emotional needs and self-expression styles are in conflict. You need to learn to respect each other's fundamental differences."
  },
  "Sun_Venus": {
    "good": "Strong attraction — you appreciate and enjoy each other. The Sun person is drawn to the Venus person's charm and beauty; the relationship is full of warmth and pleasure.",
    "hard": "Values and aesthetics sometimes clash, but the attraction remains."
  },
  "Sun_Mars": {
    "good": "A passionate and energetic combination. Strong drive to act — you can accomplish much together. Powerful sexual attraction.",
    "hard": "Prone to competition and power struggles — the clash of egos needs reconciliation."
  },
  "Moon_Venus": {
    "good": "The emotional relationship is highly harmonious — you naturally give each other the emotional nourishment needed. You enjoy being together and sharing good times.",
    "hard": "Different styles of emotional expression; one party needs to find balance between emotion and affection."
  },
  "Moon_Mars": {
    "good": "The emotional relationship is full of passion and vitality — you spark each other's emotional expression.",
    "hard": "Prone to emotional conflicts and arguments; emotional reactions are intense."
  },
  "Venus_Mars": {
    "good": "Extremely strong sexual attraction and romantic energy. The Venus person's soft beauty and Mars person's masculine energy form perfect magnetic polarity.",
    "hard": "Passion comes fast but may fade fast;friction easily arises in intimate relationships."
  },
  "Sun_Saturn": {
    "good": "The relationship is stable and lasting; both are responsible toward each other. The Saturn person gives the Sun person practical guidance and protection.",
    "hard": "The Saturn person may be too harsh or restrictive toward the Sun person, causing feelings of oppression."
  },
  "Jupiter_Venus": {
    "good": "You bring each other joy and expansive energy. Together you feel lucky and abundant — great companions for social activities and travel.",
    "hard": "May over-indulge or have excessively high expectations of the relationship."
  },
  "Saturn_Moon": {
    "good": "The Saturn person gives the Moon person stable emotional support. The relationship is serious and committed, with potential for long-term commitment.",
    "hard": "The Moon person may feel emotionally neglected or misunderstood, needing more warmth."
  }
};


// ── i18n Proxy for PLANET_SIGN ──────────────────────────────────────────
const PLANET_SIGN = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? PLANET_SIGN_EN : PLANET_SIGN_ZH;
    return src[prop];
  }
});



const HOUSE_MEANINGS_ZH = {
  1: "第1宫代表自我形象、人格面具和给他人留下的第一印象。此处的行星强烈影响你的外在气质和人生路径的起点。",
  2: "第2宫代表财富、价值观和自我价值感。此处的行星影响你的赚钱方式和物质资源的积累。",
  3: "第3宫代表沟通、学习、兄弟姐妹和短途旅行。此处的行星影响你的思维方式和信息处理能力。",
  4: "第4宫代表家庭、根源、父亲和晚年的生活环境。此处的行星揭示你的家庭背景和内在安全感。",
  5: "第5宫代表创造力、恋爱、子女和娱乐。此处的行星影响你的浪漫表达和创造性的自我展现。",
  6: "第6宫代表工作、健康、服务和日常生活。此处的行星影响你的工作方式和身体状况。",
  7: "第7宫代表婚姻、合作关系和公开的对手。此处的行星揭示你对伴侣的需求和关系模式。",
  8: "第8宫代表性、死亡、转变和他人的资源。此处的行星影响你对深层生命议题的处理方式。",
  9: "第9宫代表高等教育、哲学、长途旅行和信仰。此处的行星影响你的人生观和精神追求。",
  10: "第10宫代表事业、社会地位、母亲和人生目标。此处的行星影响你的职业方向和社会成就。",
  11: "第11宫代表朋友、社群、希望和理想。此处的行星影响你的社交圈和长远愿景。",
  12: "第12宫代表潜意识、灵性、隐秘的事物和自我消融。此处的行星揭示你的内在灵性世界和业力课题。"
};
// ── HOUSE_MEANINGS_EN ─────────────────────────────────────────────────


const HOUSE_LABELS_ZH = {
  1: '自我形象与个人表达',
  2: '财富积累与价值确认',
  3: '沟通学习与信息传播',
  4: '家庭根基与内在安全',
  5: '创造力与浪漫表达',
  6: '日常工作与健康服务',
  7: '伴侣关系与合作共赢',
  8: '深度转化与资源运作',
  9: '哲学探索与远行拓展',
  10: '事业成就与社会地位',
  11: '社交圈与长远愿景',
  12: '灵性修行与潜意识'
};
// ── HOUSE_LABELS_EN ───────────────────────────────────────────────────


const SIGN_MEANING_ZH = {
  0:"白羊座是火象开创星座，代表新的开始、原始冲动和竞争精神。能量直接而强烈。",
  1:"金牛座是土象固定星座，代表稳定、感官享受和物质积累。能量踏实而持久。",
  2:"双子座是风象变动星座，代表信息、交流和多样性。能量轻盈而灵活。",
  3:"巨蟹座是水象开创星座，代表情感、家庭和滋养。能量温柔而深邃。",
  4:"狮子座是火象固定星座，代表创造、自信和表现。能量热烈而辉煌。",
  5:"处女座是土象变动星座，代表服务、精细和分析。能量精准而实用。",
  6:"天秤座是风象开创星座，代表和谐、美感和关系。能量优雅而平衡。",
  7:"天蝎座是水象固定星座，代表深度、转变和力量。能量强烈而神秘。",
  8:"射手座是火象变动星座，代表探索、自由和真理。能量乐观而奔放。",
  9:"摩羯座是土象开创星座，代表成就、责任和纪律。能量严肃而坚韧。",
  10:"水瓶座是风象固定星座，代表创新、独立和博爱。能量前卫而理性。",
  11:"双鱼座是水象变动星座，代表慈悲、灵性和融合。能量柔软而无边。"
};
// ── SIGN_MEANING_EN ───────────────────────────────────────────────────

// ── i18n Proxy for SIGN_MEANING ────────────────────────────────────────
const SIGN_MEANING = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? SIGN_MEANING_EN : SIGN_MEANING_ZH;
    return src[prop];
  }
});

// ── i18n Proxy for HOUSE_MEANINGS ────────────────────────────────────────
const HOUSE_MEANINGS = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? HOUSE_MEANINGS_EN : HOUSE_MEANINGS_ZH;
    return src[prop];
  }
});

// ── i18n Proxy for HOUSE_LABELS ────────────────────────────────────────
const HOUSE_LABELS = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? HOUSE_LABELS_EN : HOUSE_LABELS_ZH;
    return src[prop];
  }
});

// Planet-to-planet aspect interpretations for synastry
const SYNASTRY_ASPECTS_ZH = {
  "Sun_Moon": { good:"你们在情感和意志层面有天然的共鸣。太阳方的自我表达能滋养月亮方的情绪需求，是经典的婚姻相位。", hard:"你们的情感需求和自我表达方式存在冲突。需要学会尊重彼此的根本差异。" },
  "Sun_Venus": { good:"强烈的吸引力，彼此欣赏和喜爱。太阳方被金星方的魅力和美感吸引，关系充满温暖和愉悦。", hard:"价值观和审美有时不一致，但吸引力仍然存在。" },
  "Sun_Mars": { good:"充满激情和活力的组合。行动力强，能一起完成很多事情。性吸引力强烈。", hard:"容易产生竞争和权力斗争，自我意志的碰撞需要调和。" },
  "Moon_Venus": { good:"情感关系非常和谐，彼此能给予对方所需的情感滋养。喜欢待在一起，共享美好时光。", hard:"情感表达方式不同，一方需要在情绪和爱意之间找到平衡。" },
  "Moon_Mars": { good:"情感关系中充满激情和活力，能激发彼此的情绪表达。", hard:"容易产生情绪冲突和争吵，情绪反应激烈。" },
  "Venus_Mars": { good:"极强的性吸引力和浪漫能量。金星方的柔美与火星方的阳刚形成完美的磁极吸引。", hard:"激情来得快去得也快，容易在亲密关系中产生摩擦。" },
  "Sun_Saturn": { good:"关系稳定长久，彼此负责任。土星方给予太阳方实际的指导和保护。", hard:"土星方可能对太阳方过于苛刻或限制，导致压抑感。" },
  "Jupiter_Venus": { good:"彼此带来快乐和扩张的能量。在一起时感觉幸运和富足，是很好的社交和旅行伙伴。", hard:"可能过度放纵或对关系期望过高。" },
  "Saturn_Moon": { good:"土星方给予月亮方稳定的情感支持。关系严肃认真，有长期承诺的潜力。", hard:"月亮方可能感觉情感上被冷落或不被理解，需要更多温暖。" }
};
// ── SYNASTRY_ASPECTS_EN ───────────────────────────────────────────────

// ── i18n Proxy for SYNASTRY_ASPECTS ────────────────────────────────────────
const SYNASTRY_ASPECTS = new Proxy({}, {
  get(target, prop) {
    const src = (window._lang && window._lang() === "en") ? SYNASTRY_ASPECTS_EN : SYNASTRY_ASPECTS_ZH;
    return src[prop];
  }
});



// ═══════════════════════════════════════════════════════════════════════════
//  TAROT SYSTEM — 78 cards, 3-card & single-card spreads
// ═══════════════════════════════════════════════════════════════════════════

const MAJOR_ARCANA = [
  { id:0, name:"愚者", en:"The Fool", num:"0",
    up:"新的开始、冒险精神、天真无畏、信任宇宙的安排、无限可能",
    rev:"鲁莽冲动、缺乏计划、被欺骗、过于天真、逃避责任",
    love:"一段全新的恋情或感情阶段即将开始。放下过去的包袱，像愚者一样勇敢地跳入未知。保持开放和信任的心态。",
    career:"新的职业方向或创业机会正在召唤你。虽然前路未知，但宇宙在鼓励你大胆迈出第一步。相信直觉。",
    advice:"不要过度分析，不要等待完美时机。宇宙在邀请你迈出信任的一步，旅程本身就会教会你一切。",
    up_EN:"New beginnings, adventurous spirit, fearless innocence, trusting the universe's plan, infinite possibilities",
    rev_EN:"Reckless impulses, lack of planning, being deceived, naive to a fault, avoiding responsibility",
    love_EN:"A brand new romance or emotional phase is about to begin. Let go of past baggage and, like the Fool, leap bravely into the unknown. Stay open and trusting.",
    career_EN:"A new career direction or entrepreneurial opportunity is calling you. Though the path ahead is unknown, the universe encourages you to boldly take the first step. Trust your intuition.",
    advice_EN:"Don't over-analyze. Don't wait for the perfect moment. The universe invites you to take one trusting step — the journey itself will teach you everything." },
  { id:1, name:"魔术师", en:"The Magician", num:"I",
    up:"创造力、技能、自信、资源整合、心想事成的能力、意志力",
    rev:"欺骗、操纵、技能不足、资源浪费、计划受阻、自信缺失",
    love:"你拥有吸引理想伴侣的所有条件。主动展现真实的自己，用你的魅力和智慧去创造你想要的感情生活。",
    career:"现在是将想法转化为行动的最佳时机。你拥有所需的全部技能和资源。专注目标，展现专业能力。",
    advice:"你手中握有所有元素（风火水土），只需将它们整合并付诸行动。相信自己，你可以创造奇迹。",
    up_EN:"Creativity, skill, confidence, resourcefulness, the power to manifest, willpower",
    rev_EN:"Deception, manipulation, lack of skill, wasted resources, blocked plans, lack of confidence",
    love_EN:"You have all the conditions to attract your ideal partner. Take initiative in showing your true self — use your charm and wisdom to create the love life you desire.",
    career_EN:"Now is the best time to turn ideas into action. You have all the skills and resources you need. Focus on your goals and showcase your professional abilities.",
    advice_EN:"You hold all the elements (fire, water, air, earth) in your hands — now integrate them and take action. Trust yourself — you can create miracles." },
  { id:2, name:"女祭司", en:"The High Priestess", num:"II",
    up:"直觉、潜意识、内在智慧、神秘、等待、灵性觉醒",
    rev:"忽视直觉、隐藏的秘密被揭露、情感封闭、肤浅、内在混乱",
    love:"静下心来倾听内心的声音。有些答案不在外面，而在你内心深处。保持神秘感，不要过早暴露全部底牌。",
    career:"表面之下的信息比可见的部分更重要。相信你的直觉判断，特别是在涉及隐藏信息或未明朗的局面时。",
    advice:"向内探索，而非向外寻求答案。静坐、冥想、关注梦境。答案会在你准备好时自然浮现。",
    up_EN:"Intuition, subconscious, inner wisdom, mystery, waiting, spiritual awakening",
    rev_EN:"Ignoring intuition, hidden secrets revealed, emotional withdrawal, superficiality, inner chaos",
    love_EN:"Quiet your mind and listen to your inner voice. Some answers aren't out there — they're deep within you. Maintain some mystery — don't reveal all your cards too soon.",
    career_EN:"What lies beneath the surface is more important than what's visible. Trust your intuitive judgment, especially in situations with hidden information or uncertainty.",
    advice_EN:"Go inward rather than seeking answers outside. Sit in stillness, meditate, pay attention to your dreams. Answers will surface naturally when you are ready." },
  { id:3, name:"皇后", en:"The Empress", num:"III",
    up:"丰饶、母爱、创造力、自然、感官享受、滋养、繁荣",
    rev:"依赖过度、创造力枯竭、忽视自我照顾、物质匮乏、情感冷漠",
    love:"爱与温暖围绕着你。现在是享受关系中的甜蜜和滋养的时刻。单身者可能遇到一位温暖而富有魅力的人。",
    career:"创意项目将获得丰硕成果。适合从事与美、艺术、自然或照顾他人相关的工作。财务上也有增长的好兆头。",
    advice:"像皇后一样，允许自己去感受、去创造、去享受生活中的美好。照顾好你的身体和心灵，丰盛自然而来。",
    up_EN:"Abundance, motherly love, creativity, nature, sensual pleasure, nourishment, prosperity",
    rev_EN:"Over-dependence, creative depletion, neglecting self-care, material scarcity, emotional coldness",
    love_EN:"Love and warmth surround you. Now is a time to enjoy the sweetness and nourishment in your relationship. Singles may meet someone warm and charismatic.",
    career_EN:"Creative projects will bear abundant fruit. Well-suited for work related to beauty, art, nature, or caring for others. Financial growth is also on the horizon.",
    advice_EN:"Like the Empress, allow yourself to feel, to create, to enjoy the beauty of life. Take care of your body and soul — abundance follows naturally." },
  { id:4, name:"皇帝", en:"The Emperor", num:"IV",
    up:"权威、结构、领导力、稳定、规则、保护、野心",
    rev:"专制、滥用权力、不稳定、缺乏纪律、失控、软弱",
    love:"关系中需要建立清晰的边界和规则。寻找一位成熟稳重的伴侣，或在现有关系中承担更多的责任和承诺。",
    career:"职场中展现出领导才能。现在是为长远目标建立稳固基础的时候。遵守规则，建立秩序，逐步攀升。",
    advice:"用理性和纪律来组织你的生活。建立稳固的结构和规则，这看似枯燥，却是实现长远目标的基础。",
    up_EN:"Authority, structure, leadership, stability, rules, protection, ambition",
    rev_EN:"Tyranny, abuse of power, instability, lack of discipline, loss of control, weakness",
    love_EN:"Clear boundaries and rules need to be established in your relationship. Seek a mature and steady partner, or take on more responsibility and commitment in your current relationship.",
    career_EN:"Your leadership abilities are showing in the workplace. Now is the time to build a solid foundation for long-term goals. Follow the rules, establish order, and steadily rise.",
    advice_EN:"Organize your life with reason and discipline. Building solid structures and rules may seem tedious, but it's the foundation for achieving your long-term goals." },
  { id:5, name:"教皇", en:"The Hierophant", num:"V",
    up:"传统、信仰、教育、导师、精神指引、仪式、社会规范",
    rev:"挑战传统、反叛、不受教、过时观念、教条主义、盲目追随",
    love:"传统形式的感情或婚姻可能被提上日程。寻求长辈或专业人士的情感建议。遵循内心的道德准则。",
    career:"寻找导师或参加专业培训将大有裨益。遵循行业规范，在现有的体系内稳步前进比另辟蹊径更有效。",
    advice:"你不需要独自解决所有问题。寻找一位导师或加入一个有共同信念的团体。遵循经过验证的道路。",
    up_EN:"Tradition, faith, education, mentorship, spiritual guidance, ritual, social norms",
    rev_EN:"Challenging tradition, rebellion, unteachable, outdated ideas, dogmatism, blind following",
    love_EN:"Traditional forms of romance or marriage may be on the horizon. Seek relationship advice from elders or professionals. Follow your inner moral compass.",
    career_EN:"Finding a mentor or pursuing professional training will be highly beneficial. Follow industry norms — steady progress within the existing system is more effective than blazing a new trail.",
    advice_EN:"You don't need to solve everything alone. Find a mentor or join a community that shares your beliefs. Follow the proven path." },
  { id:6, name:"恋人", en:"The Lovers", num:"VI",
    up:"真爱、和谐、选择、价值观念、结合、吸引力、重要决定",
    rev:"分离、背叛、价值观冲突、错误选择、犹豫不决、不平衡",
    love:"爱情是当前的核心主题。无论是新恋情的开始还是现有关系的深化，都需要发自内心的真诚选择。",
    career:"面临重要的职业选择。选择你真正热爱和相信的方向，而不仅仅是看起来有利可图的。合作伙伴关系至关重要。",
    advice:"你正站在十字路口。这个选择反映了你的核心价值观。选择出于爱而非恐惧的道路。",
    up_EN:"True love, harmony, choice, values, union, attraction, important decision",
    rev_EN:"Separation, betrayal, value conflicts, wrong choice, indecision, imbalance",
    love_EN:"Love is the central theme right now. Whether it's the beginning of a new romance or deepening an existing relationship, what's needed is a sincere choice from the heart.",
    career_EN:"You face an important career decision. Choose the direction you truly love and believe in, not just what looks profitable. Partnership is crucial.",
    advice_EN:"You stand at a crossroads. This choice reflects your core values. Choose the path of love, not fear." },
  { id:7, name:"战车", en:"The Chariot", num:"VII",
    up:"胜利、决心、意志力、掌控、前进、克服困难、野心实现",
    rev:"失控、失败、攻击性、方向错误、被击败、缺乏信心",
    love:"感情方面你需要主动掌控方向盘。用决心和毅力克服感情中的障碍。异地恋或需要努力维持的关系将取得进展。",
    career:"竞争激烈的环境中你能脱颖而出。保持专注，用钢铁般的意志克服一切阻碍。胜利属于坚持到最后的人。",
    advice:"你已经拥有战胜一切困难的力量。关键在于驾驭内心各种冲突的力量，让它们朝同一个方向前进。",
    up_EN:"Victory, determination, willpower, control, forward momentum, overcoming obstacles, ambition fulfilled",
    rev_EN:"Loss of control, failure, aggression, wrong direction, defeated, lack of confidence",
    love_EN:"In love, you need to take the wheel. Use determination and perseverance to overcome obstacles in your relationship. Long-distance relationships or those requiring effort will make progress.",
    career_EN:"You can stand out in a competitive environment. Stay focused and overcome every barrier with iron will. Victory belongs to those who persist to the end.",
    advice_EN:"You already have the strength to overcome any challenge. The key is to harness the conflicting forces within you and make them move in the same direction." },
  { id:8, name:"力量", en:"Strength", num:"VIII",
    up:"内在力量、勇气、耐心、温柔的力量、驯服本能、自信",
    rev:"软弱、自我怀疑、失控、攻击性、缺乏耐心、被本能支配",
    love:"用温柔而非控制来赢得对方的心。你内心的力量足以化解感情中的矛盾。耐心和包容是最强大的武器。",
    career:"以柔克刚是当前的制胜策略。不需要大声证明自己，你的专业能力和内在沉稳自行会说话。",
    advice:"真正的力量不是征服外在，而是驯服内在的野兽。用爱和耐心对待自己的恐惧和不安。",
    up_EN:"Inner strength, courage, patience, gentle power, taming instincts, confidence",
    rev_EN:"Weakness, self-doubt, loss of control, aggression, impatience, ruled by instinct",
    love_EN:"Win their heart with gentleness, not control. Your inner strength is enough to dissolve conflicts in your relationship. Patience and acceptance are your most powerful weapons.",
    career_EN:"Overcoming hardness with softness is your winning strategy right now. You don't need to loudly prove yourself — your professional ability and inner calm speak for themselves.",
    advice_EN:"True strength is not conquering the external, but taming the beast within. Treat your fears and insecurities with love and patience." },
  { id:9, name:"隐士", en:"The Hermit", num:"IX",
    up:"内省、独处、智慧、寻求真理、指引、沉淀、深思熟虑",
    rev:"孤独、孤立、逃避、拒绝建议、迷失方向、偏执",
    love:"需要一段独处来反思自己在感情中真正的需求。不要为了填补空虚而匆忙进入关系。内在的圆满才能吸引健康的爱情。",
    career:"暂时从外界的喧嚣中抽离，重新审视你的职业方向。深造、进修或独立研究将带来突破性的洞见。",
    advice:"回归内心，在寂静中找到答案。你不需要更多的信息，你需要的是更深的洞察。独处不是逃避，是蓄力。",
    up_EN:"Introspection, solitude, wisdom, seeking truth, guidance, contemplation, deep reflection",
    rev_EN:"Loneliness, isolation, avoidance, rejecting advice, lost direction, stubbornness",
    love_EN:"You need a period of solitude to reflect on what you truly need in love. Don't rush into a relationship just to fill a void. Inner wholeness attracts healthy love.",
    career_EN:"Step back from the noise of the outside world and reexamine your career direction. Further study, training, or independent research will bring breakthrough insights.",
    advice_EN:"Return to your heart — find answers in silence. You don't need more information; you need deeper insight. Solitude is not avoidance — it's gathering strength." },
  { id:10, name:"命运之轮", en:"Wheel of Fortune", num:"X",
    up:"命运转变、机遇、周期、运气、转折点、命运的安排",
    rev:"厄运、阻力、失控、负循环、错失机会、命运受阻",
    love:"命运的齿轮正在转动。命中注定的相遇或重逢可能到来。接受感情中的周期性变化，把握当下出现的缘分。",
    career:"职场或事业即将迎来重要转折。好运正在靠近，但你需要主动抓住机会。命运的青睐往往伴随着准备。",
    advice:"你是命运之轮的一部分。好运和坏运都是暂时的，顺应变化而不是抵抗它。站在轮子的中心保持平衡。",
    up_EN:"Turn of fate, opportunity, cycles, luck, turning point, destiny's arrangement",
    rev_EN:"Bad luck, resistance, loss of control, negative cycles, missed opportunities, blocked fortune",
    love_EN:"The gears of fate are turning. A destined meeting or reunion may be approaching. Accept the cyclical nature of relationships and seize the connections that appear now.",
    career_EN:"An important turning point in your career is approaching. Good luck is near, but you need to take initiative to seize opportunities. Fortune favors the prepared.",
    advice_EN:"You are part of the Wheel of Fortune. Both good and bad luck are temporary — flow with change rather than resist it. Stand at the center of the wheel and keep your balance." },
  { id:11, name:"正义", en:"Justice", num:"XI",
    up:"公正、真相、因果、平衡、法律、决定、理性",
    rev:"不公、偏见、逃避后果、失衡、法律纠纷、错误判断",
    love:"感情中需要公平和诚实。现在做出的决定将产生影响深远的后果。真诚面对自己和伴侣，做出公正的选择。",
    career:"涉及合同、谈判或法律事务时需格外谨慎。你过去在职场中的行为将在此时得到公正的回报（好或坏）。",
    advice:"因果法则正在运作。诚实地评估自己的处境，为你的选择承担后果。公正不仅是对别人，也是对自己。",
    up_EN:"Fairness, truth, cause and effect, balance, law, decision, rationality",
    rev_EN:"Injustice, bias, avoiding consequences, imbalance, legal disputes, poor judgment",
    love_EN:"Fairness and honesty are needed in your relationship. Decisions made now will have far-reaching consequences. Face yourself and your partner honestly, and make a just choice.",
    career_EN:"Be especially careful with contracts, negotiations, or legal matters. Your past actions in the workplace will receive their fair return at this time — good or bad.",
    advice_EN:"The law of cause and effect is at work. Honestly assess your situation and take responsibility for your choices. Justice applies not only to others, but to yourself." },
  { id:12, name:"倒吊人", en:"The Hanged Man", num:"XII",
    up:"牺牲、换个角度看世界、放手、等待、灵性启迪、暂停",
    rev:"停滞、无谓的牺牲、固执己见、不愿放手、拖延、内耗",
    love:"在感情中可能需要做出某种牺牲或妥协。暂时放下一味追求的执念，转换视角看问题，会有新的领悟。",
    career:"当前可能需要暂停或延迟。这不是失败，而是让你换个角度审视自己的职业路径。耐心的等待自有其价值。",
    advice:"当你觉得被困住时，试着倒过来看世界。有时候最大的行动是停止行动，最大的控制是放手。",
    up_EN:"Sacrifice, seeing from a different angle, letting go, waiting, spiritual insight, pause",
    rev_EN:"Stagnation, needless sacrifice, stubbornness, unwilling to let go, procrastination, inner friction",
    love_EN:"You may need to make a sacrifice or compromise in your relationship. Temporarily release the obsession with pursuing — shift your perspective and new insights will emerge.",
    career_EN:"A pause or delay may be needed right now. This is not failure — it's an opportunity to reexamine your career path from a different angle. Patient waiting has its own value.",
    advice_EN:"When you feel stuck, try looking at the world upside down. Sometimes the greatest action is to stop acting, and the greatest control is to let go." },
  { id:13, name:"死神", en:"Death", num:"XIII",
    up:"转变、结束、新生、蜕变、放下过去、必然的改变",
    rev:"抗拒改变、停滞不前、恐惧结束、无法放手、腐朽",
    love:"一段旧有的感情模式必须结束，才能迎来新的可能。不要抗拒感情的转变和蜕变。结束是为了更好的开始。",
    career:"可能面临职业的重大转变——离职、转行或项目终结。这是蜕变的阵痛，新生的曙光紧随其后。",
    advice:"死神牌不是肉体的死亡，而是旧我的消融。放下那些已经不再服务你的人和事，让蜕变自然发生。",
    up_EN:"Transformation, ending, rebirth, metamorphosis, letting go of the past, inevitable change",
    rev_EN:"Resisting change, stagnation, fearing endings, unable to let go, decay",
    love_EN:"An old relationship pattern must end for new possibilities to emerge. Don't resist the transformation of your love life. Endings make way for better beginnings.",
    career_EN:"You may face a major career change — resignation, career shift, or project closure. This is the growing pain of transformation — the dawn of rebirth follows closely behind.",
    advice_EN:"The Death card is not physical death, but the dissolution of the old self. Let go of people and things that no longer serve you. Allow the transformation to unfold naturally." },
  { id:14, name:"节制", en:"Temperance", num:"XIV",
    up:"平衡、调和、耐心、中庸之道、融合、治愈、适应",
    rev:"失衡、过度、缺乏节制、冲突、不和谐、急躁",
    love:"感情需要双方的调和与融合。避免极端情绪，寻找两人之间的平衡点。细水长流的爱比轰轰烈烈更持久。",
    career:"工作中需要平衡多个方面——效率与质量、合作与独立。找到适合自己的节奏，不急不躁地稳步前进。",
    advice:"像炼金术师一样，将生活中不同的元素融合成黄金。避免极端，中庸之道是你当前的智慧之选。",
    up_EN:"Balance, moderation, patience, the middle way, fusion, healing, adaptation",
    rev_EN:"Imbalance, excess, lack of moderation, conflict, disharmony, impulsiveness",
    love_EN:"Relationships need blending and harmony from both sides. Avoid emotional extremes — find the balance point between you. A steady, flowing love lasts longer than dramatic passion.",
    career_EN:"Work requires balancing multiple dimensions — efficiency and quality, collaboration and independence. Find your own rhythm and move forward steadily, without rushing or anxiety.",
    advice_EN:"Like an alchemist, blend the different elements of your life into gold. Avoid extremes — the middle way is your wisest choice right now." },
  { id:15, name:"恶魔", en:"The Devil", num:"XV",
    up:"束缚、物质主义、欲望、执念、阴影面、上瘾、权力",
    rev:"挣脱束缚、觉醒、面对阴影、重获自由、戒除成瘾",
    love:"审视感情中是否存在不健康的依赖、控制或执念。也许是性吸引掩盖了真正的问题。诚实面对黑暗面才能解脱。",
    career:"你可能被困在一份只有金钱回报但没有热情的工作中。检查权力关系和职场中的操控。改变始于认清现实。",
    advice:"锁链其实是你自己戴上的。正视你的欲望和恐惧——它们控制你的程度远比你意识到的深。你可以选择自由。",
    up_EN:"Bondage, materialism, desire, obsession, the shadow self, addiction, power",
    rev_EN:"Breaking free, awakening, facing the shadow, regaining freedom, overcoming addiction",
    love_EN:"Examine whether unhealthy dependency, control, or obsession exists in your relationship. Perhaps sexual attraction is masking the real issues. Only by honestly facing the darkness can you find liberation.",
    career_EN:"You may be trapped in a job that offers only financial reward but no passion. Examine power dynamics and manipulation in the workplace. Change begins with seeing reality clearly.",
    advice_EN:"The chains are ones you put on yourself. Face your desires and fears — they control you far more than you realize. You can choose freedom." },
  { id:16, name:"高塔", en:"The Tower", num:"XVI",
    up:"突变、崩塌、启示、真相大白、打破幻象、觉醒",
    rev:"避免灾难、抗拒改变、延迟不可避免的崩塌、恐惧突破",
    love:"关系中一些虚假的稳定可能会突然崩塌。虽然痛苦，但真相的揭露会让你看清关系的本质。重建需要勇气。",
    career:"职场中可能出现突如其来的变动——被裁员、项目失败或组织重组。这是宇宙在推你走向更真实的道路。",
    advice:"高塔的崩塌是剧烈的，但它摧毁的只是那些本就不稳固的东西。在废墟之上，你可以建造真正坚固的新生。",
    up_EN:"Sudden change, collapse, revelation, truth exposed, shattering illusions, awakening",
    rev_EN:"Avoiding disaster, resisting change, delaying the inevitable collapse, fearing breakthrough",
    love_EN:"Some false stability in your relationship may suddenly collapse. Though painful, the revelation of truth will help you see the relationship's true nature. Rebuilding takes courage.",
    career_EN:"Sudden upheaval may occur in the workplace — layoffs, project failure, or organizational restructuring. The universe is pushing you toward a more authentic path.",
    advice_EN:"The Tower's collapse is violent, but it only destroys what was never solid to begin with. On the ruins, you can build something truly strong and new." },
  { id:17, name:"星星", en:"The Star", num:"XVII",
    up:"希望、疗愈、灵感、宁静、信念、重生、指引",
    rev:"绝望、失去信心、消极、灵感枯竭、自我否定、迷失",
    love:"感情中的疗愈和新生正在发生。过去的伤痛正在愈合，你将重新相信爱情的美好。保持希望，星光正指引着你。",
    career:"职业生涯迎来充满希望的新阶段。创意灵感源源不断，你的才华将被看见和欣赏。梦想正在变为现实。",
    advice:"暴风雨后的宁静星空。你在正确的道路上，宇宙正在用星光为你照亮前路。保持信念，疗愈自己。",
    up_EN:"Hope, healing, inspiration, serenity, faith, renewal, guidance",
    rev_EN:"Despair, loss of faith, negativity, creative drought, self-denial, feeling lost",
    love_EN:"Healing and renewal are unfolding in your love life. Past wounds are mending, and you will believe in the beauty of love again. Keep hope alive — the starlight is guiding you.",
    career_EN:"Your career is entering a hopeful new phase. Creative inspiration flows abundantly, and your talents will be seen and appreciated. Dreams are becoming reality.",
    advice_EN:"The calm, starry sky after the storm. You are on the right path — the universe is lighting your way with starlight. Keep the faith and heal yourself." },
  { id:18, name:"月亮", en:"The Moon", num:"XVIII",
    up:"幻觉、恐惧、潜意识、梦境、直觉、迷惑、未知",
    rev:"恐惧消散、真相浮现、克服焦虑、混乱结束、看清现实",
    love:"感情中可能存在误解、隐藏的信息或不明确的局面。不要被表面的幻象迷惑。信任直觉，但也要保持理性。",
    career:"职场中的某些事情可能并非表面看起来那样。谨慎行事，在信息不明确时避免重大决策。迷雾终将散去。",
    advice:"在月光下，一切都显得朦胧而不确定。你内心最深处的恐惧可能被放大——直面它们，你会发现它们只是影子。",
    up_EN:"Illusion, fear, the subconscious, dreams, intuition, confusion, the unknown",
    rev_EN:"Fear dissipating, truth emerging, overcoming anxiety, chaos ending, seeing reality clearly",
    love_EN:"There may be misunderstandings, hidden information, or unclear situations in your love life. Don't be fooled by surface illusions. Trust your intuition, but also stay rational.",
    career_EN:"Certain things in the workplace may not be what they seem. Proceed with caution, and avoid major decisions when information is unclear. The fog will eventually lift.",
    advice_EN:"Under the moonlight, everything appears hazy and uncertain. Your deepest fears may be magnified — face them directly, and you'll discover they are only shadows." },
  { id:19, name:"太阳", en:"The Sun", num:"XIX",
    up:"快乐、成功、活力、真理、童真、光明、成就",
    rev:"暂时的黯淡、缺乏自信、抑郁、延迟的快乐、悲观",
    love:"爱情中最灿烂的一张牌。热烈、真诚、充满快乐的感情。单身者将遇到阳光般温暖的人。关系中的一切都被温暖照亮。",
    career:"你正处于事业的阳光时刻。成就被认可，才华被赏识。享受这段黄金时期，同时用它来照亮更多人。",
    advice:"世界为你点亮了聚光灯。这是属于你的高光时刻——享受它，分享它，让内心的阳光照亮你走的每一步。",
    up_EN:"Joy, success, vitality, truth, childlike innocence, radiance, achievement",
    rev_EN:"Temporary dimming, lack of confidence, depression, delayed happiness, pessimism",
    love_EN:"The most radiant card in love. Warm, sincere, joy-filled romance. Singles will meet someone who shines like sunshine. Everything in the relationship is illuminated by warmth.",
    career_EN:"You are in the sunshine moment of your career. Your achievements are recognized, and your talents are appreciated. Enjoy this golden period while using it to brighten the path for others.",
    advice_EN:"The world has turned the spotlight on you. This is your moment to shine — enjoy it, share it, and let your inner sunshine illuminate every step you take." },
  { id:20, name:"审判", en:"Judgement", num:"XX",
    up:"觉醒、重生、召唤、清算、宽恕、灵魂的召唤、重大决定",
    rev:"逃避召唤、无法面对过去、悔恨、拒绝改变、自我审判",
    love:"旧情复燃或感情中的重大觉醒可能到来。听从内心最真实的召唤。原谅自己和对方过去的错误，迎接感情的再生。",
    career:"你正在被召唤到更高的职业舞台。也许是转行、创业或接受一个重要项目。这是你回应灵魂使命的时刻。",
    advice:"觉醒的号角已经吹响。你不必等到「完美的时机」，现在的你已经准备好了。回应召唤，获得灵魂的升华。",
    up_EN:"Awakening, rebirth, calling, reckoning, forgiveness, soul's calling, major decision",
    rev_EN:"Avoiding the call, unable to face the past, remorse, refusing change, self-judgment",
    love_EN:"An old flame may rekindle or a major awakening in love may arrive. Listen to your heart's truest calling. Forgive yourself and your partner for past mistakes, and welcome love's rebirth.",
    career_EN:"You are being called to a higher professional stage — perhaps a career change, entrepreneurship, or taking on an important project. This is your moment to answer your soul's mission.",
    advice_EN:"The trumpet of awakening has sounded. You don't need to wait for the 'perfect moment' — you are ready now. Answer the call and receive the elevation of your soul." },
  { id:21, name:"世界", en:"The World", num:"XXI",
    up:"完成、圆满、成就、旅行、整合、宇宙意识、达成",
    rev:"未完成、拖延、不圆满、封闭、延迟成功、缺乏整合",
    love:"一段感情可能迎来圆满的结局——无论是走向更深承诺还是和平完成一个周期。你正处于感情整合的完满时刻。",
    career:"一个重要的职业周期即将圆满结束。你已完成了一个阶段的所有功课，准备好进入下一个更大的舞台。",
    advice:"你完成了一个重要的生命循环。在进入下一个周期之前，停下来庆祝你的成就。你与宇宙和谐共舞。",
    up_EN:"Completion, fulfillment, achievement, travel, integration, cosmic consciousness, attainment",
    rev_EN:"Incompletion, procrastination, lack of fulfillment, closed-off, delayed success, lack of integration",
    love_EN:"A relationship may reach a fulfilling conclusion — whether moving toward deeper commitment or peacefully completing a cycle. You are at a moment of wholeness in love.",
    career_EN:"An important career cycle is nearing its successful completion. You have finished all the lessons of one phase and are ready to enter the next, greater stage.",
    advice_EN:"You have completed an important life cycle. Before entering the next one, pause and celebrate your achievements. You are dancing in harmony with the universe." }
];

const MINOR_SUITS = [
  {
    "suit": "权杖",
    "en": "Wands",
    "element": "火",
    "theme": "行动、创造力、热情、事业",
    "theme_en": "Action, Creativity, Passion, Career",
    "cards": [
      {
        "rank": "王牌",
        "en": "Ace",
        "up": "一股强大的创造力与行动力正在你体内觉醒。这是一个全新的开始，灵感如同火焰般燃烧，推动你迈出勇敢的第一步。不要犹豫，宇宙在邀请你去开创属于自己的道路。",
        "rev": "创意的火花暂时被压抑，你可能感到动力不足或方向迷茫。新的计划遭遇延迟，不是时机未到就是你还没准备好。先整理内在的火焰，等风来再点燃。",
        "love": "一段充满激情的新恋情或现有关系的重大突破正在酝酿。主动表达你的热情和渴望，不要害怕展露真实的自己。",
        "career": "创业、新项目、跳槽的绝佳时机。你拥有开创性的能量，适合主动争取机会、提出创新方案。勇敢地做第一个点火的人。",
        "advice": "宇宙正在给你一张空白的画布。不要等待完美的时机——行动起来，让灵感在实践中成形。",
        "up_EN": "A powerful creative and active force is awakening within you. This is a brand new beginning — inspiration burns like a flame, pushing you to take the first brave step. Don't hesitate. The universe is inviting you to blaze your own trail.",
        "rev_EN": "The creative spark is temporarily suppressed. You may feel unmotivated or directionless. New plans are delayed — either the timing isn't right or you're not yet ready. Tend to your inner flame first, and wait for the wind to ignite it.",
        "love_EN": "A passionate new romance or a major breakthrough in an existing relationship is brewing. Take initiative in expressing your passion and desire. Don't be afraid to reveal your true self.",
        "career_EN": "An excellent time for entrepreneurship, new projects, or changing jobs. You possess pioneering energy — ideal for proactively seizing opportunities and proposing innovative solutions. Be brave enough to be the first to light the fire.",
        "advice_EN": "The universe is handing you a blank canvas. Don't wait for the perfect moment — take action and let inspiration take shape through practice."
      },
      {
        "rank": "二",
        "en": "2",
        "up": "你站在两个方向之间，手握选择的权力。对未来你已经有了初步的规划和设想，现在需要的是做出决定并坚定地朝前走。相信自己的远见。",
        "rev": "犹豫不决正在消耗你的能量。你可能在多个选项中徘徊，或者害怕做出错误的选择。这种优柔寡断本身就是一种决定——停滞不前。",
        "love": "在感情中面临抉择，也许是两段关系的取舍，也许是关系中某个重要决定的权衡。倾听你内心的声音，而非外界的意见。",
        "career": "职业规划的关键节点。你可能在考虑转行、跳槽或选择不同的发展方向。做好调研，然后大胆下注。",
        "advice": "选择没有绝对的对错。重要的是选择之后全力以赴。不要因为害怕选错而不选。",
        "up_EN": "You stand between two directions, holding the power of choice. You already have a preliminary plan and vision for the future — what's needed now is to make a decision and move forward with resolve. Trust your foresight.",
        "rev_EN": "Indecision is draining your energy. You may be wavering between multiple options, or afraid of making the wrong choice. This hesitation itself is a decision — to stand still.",
        "love_EN": "You face a choice in love — perhaps between two relationships, or weighing an important decision within your current one. Listen to your inner voice, not external opinions.",
        "career_EN": "A critical juncture in your career planning. You may be considering a career change, job switch, or different development path. Do your research, then boldly place your bet.",
        "advice_EN": "There is no absolute right or wrong in choices. What matters is giving your all once you've chosen. Don't let the fear of choosing wrong keep you from choosing at all."
      },
      {
        "rank": "三",
        "en": "3",
        "up": "你的远见和规划正在结出初步的果实。事业上的拓展、合作的达成、项目的推进都呈现出良好的势头。这是向外探索、扩展版图的时刻。",
        "rev": "计划遇到了阻力，可能是外部环境的变动，也可能是你自身缺乏足够的远见。初期的小挫折不应让你退缩，调整策略而非放弃目标。",
        "love": "感情关系进入了新的发展阶段，可能是同居、订婚或者一起规划未来。关系的基础正在夯实，前景可期。",
        "career": "事业拓展期，适合开拓新市场、建立新合作、推进新项目。你的领导力和远见正在得到认可。",
        "advice": "初期的成功是信心的基石，不是骄傲的资本。保持远见的同时，脚踏实地地推进每一步。",
        "up_EN": "Your vision and planning are beginning to bear fruit. Business expansion, partnership agreements, and project progress all show strong momentum. This is a time to explore outward and expand your horizons.",
        "rev_EN": "Your plans have encountered resistance — perhaps from changes in the external environment, or a lack of sufficient foresight on your part. Early setbacks shouldn't make you retreat. Adjust your strategy rather than abandoning your goal.",
        "love_EN": "Your relationship has entered a new phase of development — perhaps cohabitation, engagement, or planning a future together. The foundation of the relationship is being solidified, and the prospects are promising.",
        "career_EN": "A period of career expansion — ideal for exploring new markets, forming new partnerships, and advancing new projects. Your leadership and vision are being recognized.",
        "advice_EN": "Early success is a foundation for confidence, not a reason for pride. Maintain your vision while grounding every step in practical action."
      },
      {
        "rank": "四",
        "en": "4",
        "up": "经过努力，你迎来了稳定和收获的时刻。事业或生活的基础已经夯实，你可以安心地庆祝这来之不易的成就。这是一个享受成果、感受安全感的阶段。",
        "rev": "根基不稳，你可能感到焦虑不安。计划中的稳定被外部因素扰动，工作上出现变数。需要重新审视基础是否牢固。",
        "love": "感情关系进入稳定期，适合考虑同居、结婚或一起建立一个安稳的家。安全感和归属感是此时的核心主题。",
        "career": "职业发展进入平台期，基础已经奠定，可以享受一段安稳的时光。适合巩固已有的成果，而非激进扩张。",
        "advice": "稳固的根基是未来腾飞的跳板。珍惜现有的果实，同时为下一步的成长留出空间。",
        "up_EN": "Through hard work, you have arrived at a moment of stability and harvest. The foundation of your career or life has been solidified — you can peacefully celebrate these hard-won achievements. This is a phase of enjoying the fruits and feeling secure.",
        "rev_EN": "The foundation is unstable. You may feel anxious and unsettled. Planned stability has been disrupted by external factors, and work has encountered unexpected changes. Re-examine whether your foundation is truly solid.",
        "love_EN": "Your relationship has entered a stable period — ideal for considering cohabitation, marriage, or building a secure home together. Security and belonging are the core themes right now.",
        "career_EN": "Your career has reached a plateau phase — the foundation is laid, and you can enjoy a period of stability. This is suited for consolidating existing achievements rather than aggressive expansion.",
        "advice_EN": "A solid foundation is the springboard for future leaps. Cherish the fruits you've earned while leaving room for the next stage of growth."
      },
      {
        "rank": "五",
        "en": "5",
        "up": "竞争和挑战正在激发你的斗志。这是一个需要你站出来争取自己立场的时刻。冲突本身不是坏事，它能让你更加清楚自己的边界和力量。",
        "rev": "你被冲突耗尽能量，可能想要逃避或妥协。内部的纷争或外部的压力让你感到孤立。有时退一步不是失败，而是战略调整。",
        "love": "感情中可能出现竞争或冲突，也许是第三者的介入，也许是双方观念的碰撞。面对挑战是关系中不可避免的成长过程。",
        "career": "职场竞争加剧，你可能面临来自同事或同行的压力。将竞争转化为动力，证明自己的实力和价值。",
        "advice": "挑战是成长的催化剂。不要逃避冲突——它会告诉你你的边界在哪里，你的力量有多大。",
        "up_EN": "Competition and challenges are igniting your fighting spirit. This is a moment that calls you to stand up and fight for your position. Conflict itself is not bad — it helps you see your boundaries and strength more clearly.",
        "rev_EN": "You're drained by conflict and may want to flee or compromise. Internal strife or external pressure is making you feel isolated. Sometimes stepping back isn't failure — it's a strategic adjustment.",
        "love_EN": "Competition or conflict may arise in your love life — perhaps the involvement of a third party, or a clash of values between you. Facing challenges is an inevitable part of growth in any relationship.",
        "career_EN": "Workplace competition is intensifying. You may face pressure from colleagues or peers. Turn competition into motivation and prove your strength and value.",
        "advice_EN": "Challenges are catalysts for growth. Don't run from conflict — it will show you where your boundaries lie and how strong you truly are."
      },
      {
        "rank": "六",
        "en": "6",
        "up": "胜利的凯歌已经奏响。你的努力和坚持得到了认可和赞誉，可能是升职加薪、项目成功或公开表彰。这是属于你的荣耀时刻，请骄傲地接受掌声。",
        "rev": "失败或丢脸的经历让你备受打击。可能是傲慢导致了跌落，也可能是外界的不公正评价。无论哪种，都是一个谦逊的功课。",
        "love": "在感情中占据主动和优势，你的魅力和付出得到了伴侣的欣赏和回应。一段充满认可和赞誉的关系正在展开。",
        "career": "升职加薪、项目大获成功、行业认可——职业上的高光时刻。你的努力即将被看到并得到实质性的回报。",
        "advice": "胜利不仅是结果，更是你一路走来的印证。接受赞誉，但不要忘记那些曾经帮助过你的人。",
        "up_EN": "The song of victory has sounded. Your effort and persistence have earned recognition and praise — perhaps a promotion, salary increase, project success, or public commendation. This is your moment of glory. Accept the applause with pride.",
        "rev_EN": "An experience of failure or humiliation has dealt you a heavy blow. Perhaps arrogance led to a fall, or perhaps it's unfair judgment from others. Either way, it's a lesson in humility.",
        "love_EN": "You hold the initiative and advantage in love. Your charm and dedication are being appreciated and reciprocated by your partner. A relationship filled with recognition and mutual admiration is unfolding.",
        "career_EN": "Promotion, salary increase, major project success, industry recognition — a career highlight moment. Your efforts are about to be seen and tangibly rewarded.",
        "advice_EN": "Victory is not just the result — it's the validation of your entire journey. Accept the praise, but don't forget those who helped you along the way."
      },
      {
        "rank": "七",
        "en": "7",
        "up": "你正在坚守自己的阵地，面对压力和反对毫不退缩。这是一场勇气的考验，你需要坚持自己的信念和立场。虽然孤立，但你的勇敢值得尊敬。",
        "rev": "力量的对比让你无法继续坚守，撤退或投降也许是最明智的选择。继续硬撑只会消耗更多。有时放下是一种更大的勇气。",
        "love": "在感情中捍卫自己的底线和原则。也许面临外界的反对或伴侣的挑战，但你清楚地知道什么是不可以妥协的。",
        "career": "职场中需要坚守自己的立场，可能面临不公平的对待或恶意的竞争。勇敢地为自己发声，捍卫你的权益。",
        "advice": "独自坚守的感觉是孤独的，但这也正是你证明自己信念的时刻。知道何时该坚守，也知何时该放手。",
        "up_EN": "You are holding your ground, refusing to retreat in the face of pressure and opposition. This is a test of courage — you need to stand firm in your beliefs and position. Though isolated, your bravery is worthy of respect.",
        "rev_EN": "The balance of power makes it impossible to keep holding on. Retreat or surrender may be the wisest choice. Continuing to tough it out will only drain you further. Sometimes letting go requires greater courage.",
        "love_EN": "Defend your bottom line and principles in your relationship. You may face external opposition or challenges from your partner, but you clearly know what is non-negotiable.",
        "career_EN": "You need to hold your ground in the workplace — you may face unfair treatment or malicious competition. Bravely speak up for yourself and defend your rights.",
        "advice_EN": "Standing alone feels lonely, but this is precisely the moment that proves your conviction. Know when to hold your ground, and know when to let go."
      },
      {
        "rank": "八",
        "en": "8",
        "up": "事情正在快速推进！消息、旅行、变化接踵而至。停滞的局面即将被打破，你需要保持敏捷和开放的心态来迎接即将到来的变化。",
        "rev": "计划被推迟或取消，你期待的进展迟迟不来。这种停滞可能是外部的阻力，也可能是内在的恐惧在拖慢你的脚步。",
        "love": "感情中的变化来得很快——可能是突然的表白、关系的推进或者一起旅行。保持开放的心态迎接这段加速的旅程。",
        "career": "工作中节奏加快，可能有出差、调动或突发任务。保持灵活应变的能力，快速行动中蕴藏着新的机会。",
        "advice": "当风的翅膀展开时，不要犹豫。机会来得快也去得快，敏捷是此时最大的优势。",
        "up_EN": "Things are moving fast! News, travel, and changes are arriving one after another. The stagnation is about to be broken — you need to stay agile and open-minded to embrace the changes coming your way.",
        "rev_EN": "Plans are being postponed or canceled. The progress you've been waiting for is nowhere in sight. This stagnation may be due to external resistance or internal fear slowing you down.",
        "love_EN": "Changes in love are coming fast — perhaps a sudden confession, a relationship advancing, or traveling together. Keep an open heart to embrace this accelerated journey.",
        "career_EN": "The pace at work is quickening — there may be business trips, transfers, or unexpected tasks. Stay flexible and adaptable. New opportunities are hidden within the rapid pace.",
        "advice_EN": "When the wings of the wind unfurl, don't hesitate. Opportunities come and go quickly — agility is your greatest advantage right now."
      },
      {
        "rank": "九",
        "en": "9",
        "up": "你在最后的坚守中展现出惊人的韧性。虽然疲惫，但你还没有放弃。这最后的坚持是最珍贵的品质，再坚持一步，黎明就在前方。",
        "rev": "筋疲力尽，你的能量已经透支。也许是时候承认自己需要休息和支援。过度防御会耗尽你最后的力量。",
        "love": "感情中的坚持到了关键时刻。你可能已经疲惫，但心中还有最后一丝信念。问问自己：这段关系值得你坚持到什么程度？",
        "career": "工作压力和责任已经让你接近极限。最后的冲刺需要顽强的意志力。但也请注意：过度消耗不是可持续的策略。",
        "advice": "韧性是你最宝贵的品质，但智慧在于知道何时该休息。保护好自己的能量，这场战役还很长。",
        "up_EN": "You are showing incredible resilience in your final stand. Though weary, you haven't given up. This last stretch of perseverance is your most precious quality. Hold on one more step — dawn is just ahead.",
        "rev_EN": "Exhausted and drained, your energy is overdrawn. Perhaps it's time to admit you need rest and support. Excessive defensiveness will deplete your last reserves.",
        "love_EN": "Your persistence in love has reached a critical moment. You may be tired, but a last flicker of faith remains in your heart. Ask yourself: to what extent is this relationship worth holding on to?",
        "career_EN": "Work pressure and responsibilities have pushed you near your limit. The final sprint requires tenacious willpower. But be aware: overexertion is not a sustainable strategy.",
        "advice_EN": "Resilience is your most precious quality, but wisdom lies in knowing when to rest. Protect your energy — this battle is a long one."
      },
      {
        "rank": "十",
        "en": "10",
        "up": "负担沉重，责任如山。你可能正在承担超出常人的工作量或义务。虽然压力大，但你能够坚持完成。问题是：这些负担真的都是你的吗？",
        "rev": "你正在学会放下不属于你的重担，或者不再愿意一个人扛下所有。过度压力正在损害你的健康，放手是一种解脱。",
        "love": "感情中你承担了太多责任，也许是单方面付出太多。问问自己：这段关系是否在消耗你而非滋养你？",
        "career": "工作量大到难以承受，也许在同时处理多个项目或角色。你需要优先排序和合理分配，而不是一个人硬扛。",
        "advice": "负重前行不是能力的证明，而是边界的缺失。学会说'不'，将不属于你的担子放下。",
        "up_EN": "The burden is heavy and the responsibilities are mountainous. You may be shouldering more work or obligations than most people could bear. Though the pressure is great, you are able to carry through. The question is: do all these burdens truly belong to you?",
        "rev_EN": "You are learning to put down burdens that aren't yours, or you're no longer willing to carry everything alone. Excessive pressure is harming your health — letting go is a form of liberation.",
        "love_EN": "You are carrying too much responsibility in your relationship — perhaps giving far more than you receive. Ask yourself: is this relationship draining you rather than nourishing you?",
        "career_EN": "The workload is overwhelming — you may be handling multiple projects or roles simultaneously. You need to prioritize and delegate rather than shouldering everything alone.",
        "advice_EN": "Carrying a heavy load forward is not proof of capability — it's a sign of missing boundaries. Learn to say 'no' and put down burdens that aren't yours to carry."
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "一个充满热情和好奇心的新开始。新的消息、新的学习机会或新的探索方向正在出现。保持开放和天真的心态，像孩子一样去探索未知。",
        "rev": "不成熟的表现可能会带来麻烦。你或许在接受坏消息，或者因为缺乏方向而四处乱撞。需要更多的耐心和规划。",
        "love": "一段轻松愉快的新恋情可能在萌芽，或者在现有关系中加入新鲜的元素。保持好奇心和探索欲，让感情充满活力。",
        "career": "收到新的工作消息或学习机会。也许是培训、新项目或者职业发展的新鲜方向。保持开放的接收状态。",
        "advice": "以赤子之心面对新的开始。你还不需要知道所有答案——好奇心是你最强的导航。",
        "up_EN": "An enthusiastic and curious new beginning. New messages, new learning opportunities, or new directions for exploration are emerging. Stay open and innocent — explore the unknown like a child.",
        "rev_EN": "Immaturity may cause trouble. You may be receiving bad news, or flailing around due to a lack of direction. More patience and planning are needed.",
        "love_EN": "A light and joyful new romance may be budding, or fresh elements are entering an existing relationship. Stay curious and exploratory — keep the relationship vibrant.",
        "career_EN": "New work-related messages or learning opportunities are arriving. Perhaps training, new projects, or fresh directions for career development. Stay in receiving mode with an open mind.",
        "advice_EN": "Face new beginnings with the heart of a child. You don't need to know all the answers yet — curiosity is your strongest navigator."
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "冒险精神正在驱动你向前冲。行动迅速、激情满满，你对未来充满了无畏的勇气。这是一个冲锋的时刻，不要被恐惧拖慢脚步。",
        "rev": "鲁莽和缺乏耐心可能导致半途而废。你太急于看到结果而忽视了必要的准备和细节。慢下来，才不会翻车。",
        "love": "主动追求心仪的对象，或者在关系中注入冒险和激情。你是一个充满了浪漫勇气的骑士，但要小心不要太冲动。",
        "career": "事业上的冲锋期，适合大胆行动、主动争取。你有着充沛的行动力，但需要确保方向正确再出发。",
        "advice": "勇敢的骑士也需要地图。激情是翅膀，但计划是方向——两者兼顾才能飞得更远。",
        "up_EN": "An adventurous spirit is driving you forward. Swift action, boundless passion — you face the future with fearless courage. This is a moment to charge ahead. Don't let fear slow you down.",
        "rev_EN": "Recklessness and impatience may lead to giving up halfway. You're too eager to see results and have neglected necessary preparation and details. Slow down so you don't crash.",
        "love_EN": "Actively pursue the one you desire, or inject adventure and passion into your relationship. You are a knight full of romantic courage — but be careful not to be too impulsive.",
        "career_EN": "A charging period in your career — ideal for bold action and proactive pursuit. You have abundant drive, but make sure your direction is correct before you set off.",
        "advice_EN": "Even a brave knight needs a map. Passion gives you wings, but planning gives you direction — only with both can you fly far."
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "自信和温暖是你最大的魅力。你能够独立领导他人，同时保持亲和力。这是一个展现个人魅力和领导力的阶段，用你的创造力照亮周围。",
        "rev": "专横或缺乏安全感正在损害你的影响力。你可能在过度控制或者因为不自信而退缩。找到内在的平衡是当前的功课。",
        "love": "在感情中展现出迷人的自信和温暖。你是一个充满魅力的伴侣，能够独立地爱而不依赖。吸引力自然散发。",
        "career": "职场中的领导力得到充分发挥。你自信而不咄咄逼人，能够激励团队又保持亲和力。职业女性力量的典范。",
        "advice": "真正的女王不需要证明自己的威严——她用存在本身影响一切。你身上的温暖与自信，是最好的武器。",
        "up_EN": "Confidence and warmth are your greatest charms. You can lead others independently while maintaining warmth and approachability. This is a phase for showcasing your charisma and leadership — illuminate those around you with your creativity.",
        "rev_EN": "Bossiness or insecurity is undermining your influence. You may be over-controlling or withdrawing due to a lack of self-confidence. Finding inner balance is your current lesson.",
        "love_EN": "You radiate captivating confidence and warmth in love. You are a charming partner, capable of loving independently without dependency. Your attraction emanates naturally.",
        "career_EN": "Your leadership abilities shine fully in the workplace. You are confident without being overbearing — able to inspire the team while maintaining approachability. A model of professional feminine power.",
        "advice_EN": "A true queen doesn't need to prove her majesty — she influences everything through her presence alone. The warmth and confidence within you are your greatest weapons."
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "你正在展现成熟的领导力和远见卓识。这是一个负责任的领导者形象，能够做出果断的决定并带领他人向前。创造力与执行力兼备。",
        "rev": "权力被滥用或者因为急躁而做出错误的决定。你可能在过度专制或者因为缺乏耐心而失去追随者。",
        "love": "在感情中展现出成熟的担当和保护欲。你是一个负责任的伴侣，但也有着激情和创造力的一面。",
        "career": "事业上的顶峰状态。你具备企业家的远见和领导者的魄力，适合创业、管理或独立决策。",
        "advice": "真正的权力不是控制他人，而是引领方向。用你的远见照亮前路，让追随者自愿与你同行。",
        "up_EN": "You are demonstrating mature leadership and far-sighted vision. This is the image of a responsible leader — able to make decisive choices and lead others forward. Both creativity and execution are at your command.",
        "rev_EN": "Power is being abused, or wrong decisions are being made out of impatience. You may be overly autocratic or losing followers due to a lack of patience.",
        "love_EN": "You show mature responsibility and protective instincts in love. You are a dependable partner, yet you also have a passionate and creative side.",
        "career_EN": "The peak state of your career. You possess the vision of an entrepreneur and the decisiveness of a leader — ideal for starting a business, management, or independent decision-making.",
        "advice_EN": "True power is not controlling others — it's guiding the direction. Illuminate the path ahead with your vision, and let followers walk alongside you willingly."
      }
    ]
  },
  {
    "suit": "圣杯",
    "en": "Cups",
    "element": "水",
    "theme": "情感、爱情、直觉、关系",
    "theme_en": "Emotion, Love, Intuition, Relationships",
    "cards": [
      {
        "rank": "王牌",
        "en": "Ace",
        "up": "一股丰沛的情感能量正在涌出。新的恋情、深层的直觉、丰富的创造力都在此时被激活。敞开心扉，让爱的能量自由流动。",
        "rev": "情感被堵塞，你可能感到空虚或无法连接自己的内心。创意枯竭或感情受挫让你暂时封闭了自己。",
        "love": "一段全新的感情正在敲门。也许是命中注定的相遇，也许是现有关系的情感升华。打开心扉，爱正在流入你的生命。",
        "career": "创意工作者的灵感高峰期。适合开始新的创意项目、品牌策划或需要情感智慧的领域。让你的想象力自由流淌。",
        "advice": "爱是最强大的创造力。当你敞开心扉时，整个宇宙都会通过你表达自己。不要害怕情感的深度。",
        "up_EN": "Abundant emotional energy is flowing forth. New romance, deep intuition, and rich creativity are being activated right now. Open your heart and let the energy of love flow freely.",
        "rev_EN": "Emotions are blocked. You may feel empty or unable to connect with your inner self. Creative drought or romantic setbacks have caused you to temporarily shut down.",
        "love_EN": "A brand new romance is knocking at the door. Perhaps it's a destined meeting, or an emotional elevation of an existing relationship. Open your heart — love is flowing into your life.",
        "career_EN": "A peak period of inspiration for creative professionals. Ideal for starting new creative projects, brand strategy, or fields requiring emotional intelligence. Let your imagination flow freely.",
        "advice_EN": "Love is the most powerful creative force. When you open your heart, the entire universe expresses itself through you. Don't be afraid of emotional depth."
      },
      {
        "rank": "二",
        "en": "2",
        "up": "两个灵魂之间的深度连接正在形成。这是两情相悦的和谐时刻，彼此看到对方最真实的样子。灵魂伴侣的相遇或现有关系的升华。",
        "rev": "关系中的裂痕正在扩大，信任在流失。分离或疏远可能是当前正在面对的课题。需要诚实地审视双方之间到底发生了什么。",
        "love": "爱情中最美好的牌之一——双向奔赴的深情。你和伴侣之间有着深刻的连接和理解，这是灵魂层面的相遇。",
        "career": "商业合作或团队协作的和谐期。找到志同道合的伙伴，合作关系将为你的事业带来深远的影响。",
        "advice": "真正的连接来自平等和相互尊重。爱不是占有，而是两个完整的灵魂选择并肩同行。",
        "up_EN": "A deep connection between two souls is forming. This is a harmonious moment of mutual affection, where each sees the other's truest self. A soulmate encounter or the elevation of an existing relationship.",
        "rev_EN": "The cracks in the relationship are widening, and trust is eroding. Separation or estrangement may be the issue you're facing. Honestly examine what has truly happened between you.",
        "love_EN": "One of the most beautiful cards in love — deep affection flowing in both directions. You and your partner share a profound connection and understanding — this is a meeting at the soul level.",
        "career_EN": "A harmonious period for business partnerships or team collaboration. Find like-minded partners — collaborative relationships will bring far-reaching impact to your career.",
        "advice_EN": "True connection comes from equality and mutual respect. Love is not possession — it's two whole souls choosing to walk side by side."
      },
      {
        "rank": "三",
        "en": "3",
        "up": "友情和欢聚的快乐正在包围你。和朋友们的聚会、庆祝和分享带来心灵的滋养。这是社交和情感连接的丰收时刻。",
        "rev": "过度社交带来的疲惫，或者流言蜚语正在影响你的情绪。过多的聚会让你忽略了内在的需要。适当收敛，回归内心。",
        "love": "感情生活中的轻松和愉快正在增加。朋友聚会、约会或者轻松惬意的社交活动，让你在关系中感到快乐和满足。",
        "career": "同事关系的融洽期，团队合作和团建活动让工作氛围更加愉悦。创意和灵感在轻松的氛围中自由流动。",
        "advice": "快乐是用来分享的。在朋友中找到滋养和力量，但也不要忘记独处的重要性。",
        "up_EN": "The joy of friendship and celebration surrounds you. Gatherings with friends, celebrations, and sharing bring nourishment to the soul. This is a bountiful time for social and emotional connection.",
        "rev_EN": "Fatigue from excessive socializing, or gossip affecting your mood. Too many gatherings have made you neglect your inner needs. Pull back appropriately and return to your heart.",
        "love_EN": "Lightness and joy in your love life are increasing. Friend gatherings, dates, or relaxed social activities make you feel happy and content in your relationship.",
        "career_EN": "A period of harmonious colleague relationships — teamwork and group activities make the workplace atmosphere more pleasant. Creativity and inspiration flow freely in a relaxed environment.",
        "advice_EN": "Joy is meant to be shared. Find nourishment and strength in friends, but don't forget the importance of solitude."
      },
      {
        "rank": "四",
        "en": "4",
        "up": "你正在经历情感上的沉淀和内在的冥想。表面的快乐不再满足你，你在寻找更深的意义和连接。这是一个内省和重新评估的阶段。",
        "rev": "倦怠和麻木让你对外界的邀请无动于衷。你可能正在错过重要的机会，因为你陷入了内心的死水。需要唤醒沉睡的感知力。",
        "love": "感情进入反思期。你也许在重新评估这段关系对你的意义，或者需要一些独处的时间来理清自己的感受。",
        "career": "对当前的工作产生了倦怠感，需要重新评估职业方向。适当的休息和反思比盲目努力更重要。",
        "advice": "安静不是空虚。在静默中，你才能听到内心最真实的声音。不要害怕停下来——这是重启的前奏。",
        "up_EN": "You are going through emotional contemplation and inner meditation. Surface-level happiness no longer satisfies you — you're searching for deeper meaning and connection. This is a phase of introspection and reevaluation.",
        "rev_EN": "Apathy and numbness have made you indifferent to external invitations. You may be missing important opportunities because you're stuck in inner stagnation. You need to awaken your dormant perception.",
        "love_EN": "Your love life has entered a period of reflection. You may be reevaluating what this relationship means to you, or you need some alone time to sort through your feelings.",
        "career_EN": "You feel a sense of burnout toward your current job and need to reassess your career direction. Proper rest and reflection are more important than blind effort.",
        "advice_EN": "Stillness is not emptiness. In silence, you can hear your heart's truest voice. Don't be afraid to pause — this is the prelude to a restart."
      },
      {
        "rank": "五",
        "en": "5",
        "up": "失落和悲伤是此刻真实的感受，但请注意——在这失去的背后，希望的曙光已经出现。杯子没有完全倒下，你拥有的比你以为的多。",
        "rev": "你正在走出阴霾，开始接受现实并重建自己。虽然伤痛还在，但你已经能够看到前方的光亮。",
        "love": "感情中经历了失去或失望。但重要的是——你没有失去一切，留下的部分值得你珍惜。新的希望正在孕育。",
        "career": "职业上可能经历了挫折或损失，但这也是重新评估真正重要之事的时机。有些失去是在为更好的让路。",
        "advice": "当你只看到失去的两杯时，请回头看看——你还有三杯完好。悲伤是真实的，但希望也是。",
        "up_EN": "Loss and sorrow are real feelings in this moment, but take note — behind this loss, the light of hope has already appeared. The cups haven't all fallen — you have more than you think.",
        "rev_EN": "You are emerging from the gloom, beginning to accept reality and rebuild yourself. Though the pain still lingers, you can already see the light ahead.",
        "love_EN": "You've experienced loss or disappointment in love. But what matters is — you haven't lost everything. What remains is worth cherishing. New hope is being nurtured.",
        "career_EN": "You may have experienced setbacks or losses in your career, but this is also a time to reassess what truly matters. Some losses make way for something better.",
        "advice_EN": "When you can only see the two cups you've lost, look back — you still have three standing intact. The sadness is real, but so is the hope."
      },
      {
        "rank": "六",
        "en": "6",
        "up": "怀旧的情绪将你带回过去。纯真的回忆、童年的影子、旧时的连接正在影响你做当下的选择。这不是逃避，而是从过去汲取智慧。",
        "rev": "你沉溺在过去无法前行。美好的回忆变成了逃避现实的借口。需要拔出被过去吸住的脚，回到当下的生活中来。",
        "love": "旧情复燃或回忆过往恋情的阶段。你也许在和旧人重新建立连接，或者在回忆中寻找对当下感情的启示。",
        "career": "过去的经验正在为你提供指引。也许在回归曾经热衷的领域，或者从以往的教训中找到了新的方向。",
        "advice": "回忆是甜美的，但它只是指向过去的箭头。不要让怀旧变成拒绝当下的理由。",
        "up_EN": "Nostalgia draws you back to the past. Innocent memories, shadows of childhood, and old connections are influencing your current choices. This is not escape — it's drawing wisdom from the past.",
        "rev_EN": "You're drowning in the past and unable to move forward. Sweet memories have become an excuse to escape reality. You need to pull your feet out of the past and return to the present.",
        "love_EN": "A phase of rekindling old flames or recalling past relationships. You may be reconnecting with someone from the past, or searching memories for insight about your current love life.",
        "career_EN": "Past experience is providing guidance. Perhaps you're returning to a field you once loved, or finding new direction from past lessons.",
        "advice_EN": "Memories are sweet, but they are arrows pointing backward. Don't let nostalgia become a reason to reject the present."
      },
      {
        "rank": "七",
        "en": "7",
        "up": "你面对多种可能性，沉浸在白日梦和幻想中。美好的憧憬让你兴奋，但也需要分辨哪些是真正的机会，哪些只是幻影。",
        "rev": "幻梦破灭后的清醒时刻。你可能意识到自己一直在不切实际地幻想。虽然清醒有时残酷，但它给了你脚踏实地重新出发的机会。",
        "love": "感情中面临多种选择或诱惑，或者你对某段感情有太多不切实际的幻想。需要分辨真心和一时冲动。",
        "career": "职业发展中出现了多条可能的路径。白日梦的作用是激发愿景，但你需要将愿景与实际规划结合起来。",
        "advice": "幻想是创造力的翅膀，但地面上的行动才能让你真正飞起来。选择一条路，然后坚定地走下去。",
        "up_EN": "You face multiple possibilities, immersed in daydreams and fantasies. Beautiful visions excite you, but you also need to discern which are real opportunities and which are mere illusions.",
        "rev_EN": "A sobering moment after dreams have shattered. You may realize you've been indulging in unrealistic fantasies. Though waking up can be harsh, it gives you the chance to start fresh with both feet on the ground.",
        "love_EN": "You face multiple choices or temptations in love, or you have too many unrealistic fantasies about a certain relationship. You need to distinguish between genuine feelings and momentary impulses.",
        "career_EN": "Multiple possible paths have emerged in your career development. Daydreams serve to inspire vision, but you need to combine vision with practical planning.",
        "advice_EN": "Fantasy is the wings of creativity, but only action on the ground can truly make you fly. Choose one path, and walk it with determination."
      },
      {
        "rank": "八",
        "en": "8",
        "up": "你决定离开熟悉的环境，去寻找更高的意义和更真实的自己。放下过去的安全感和舒适区，走向未知的旅程。这是勇敢者的选择。",
        "rev": "恐惧改变让你滞留在不满意的状态中。你知道该离开，但害怕未知让你动弹不得。停留的代价正在变得越来越大。",
        "love": "离开一段不再滋养你的感情。虽然不舍，但你知道继续下去只会消耗彼此。离开是为了更高的追求。",
        "career": "辞职、转行或离开熟悉的领域去探索新的方向。这是一个勇敢的决定，但也是被内心深处的高我召唤。",
        "advice": "当你不再属于脚下的这片土地时，离开就是最深的自我忠诚。未知并不可怕，停滞才可怕。",
        "up_EN": "You've decided to leave familiar surroundings to seek higher meaning and a truer version of yourself. Let go of past security and comfort zones, and embark on a journey into the unknown. This is the choice of the brave.",
        "rev_EN": "Fear of change keeps you stuck in an unsatisfying situation. You know you should leave, but fear of the unknown paralyzes you. The cost of staying is growing larger by the day.",
        "love_EN": "Leaving a relationship that no longer nourishes you. Though it's hard to let go, you know that continuing will only deplete both of you. Leaving is for a higher purpose.",
        "career_EN": "Resigning, changing careers, or leaving a familiar field to explore new directions. This is a brave decision, and one called forth by your inner higher self.",
        "advice_EN": "When you no longer belong to the ground beneath your feet, leaving is the deepest form of self-loyalty. The unknown is not what's frightening — stagnation is."
      },
      {
        "rank": "九",
        "en": "9",
        "up": "深刻的满足感——你的情感需求正在得到满足。愿望正在实现，你感到内心充盈而喜悦。这是知足常乐的美好状态。",
        "rev": "虽然外在条件不错，但内心总感觉少了点什么。不满足感正在侵蚀你的幸福感。贪得无厌会让你看不到已经拥有的美好。",
        "love": "感情中的满足和幸福感。你正处于一段令人愉悦的关系中，内心的情感需求得到了回应和滋养。",
        "career": "职业上达到了一种满意的状态——也许是收入、成就感或工作氛围让你感到满足。享受当下的丰收。",
        "advice": "真正的富足不在于拥有更多，而在于感到自己已经足够。你此刻手中握着的，已经是很多人梦寐以求的。",
        "up_EN": "Deep satisfaction — your emotional needs are being fulfilled. Wishes are coming true, and you feel inner abundance and joy. This is the beautiful state of contentment.",
        "rev_EN": "Though external conditions look good, something still feels missing inside. A sense of dissatisfaction is eroding your happiness. Greed will prevent you from seeing the blessings you already have.",
        "love_EN": "Fulfillment and happiness in love. You are in a delightful relationship — your emotional needs are being met and nourished.",
        "career_EN": "You've reached a satisfying state in your career — perhaps it's the income, the sense of accomplishment, or the work atmosphere that brings you contentment. Enjoy this harvest.",
        "advice_EN": "True abundance is not about having more — it's about feeling that you already have enough. What you hold in your hands right now is what many people dream of."
      },
      {
        "rank": "十",
        "en": "10",
        "up": "情感的圆满和家庭的幸福达到了顶峰。这是一个充满爱与和谐的阶段，你感到自己真正属于某个地方。家庭关系、亲密关系和内心的平和都达到了理想状态。",
        "rev": "家庭中的不和谐或关系的破裂让你感到失去了归属感。需要重新修复和家庭成员之间的连接。",
        "love": "感情关系达到了婚姻或家庭层面的圆满。这是建立一个温暖家庭的理想时期，情感承诺得到深化。",
        "career": "工作和家庭的平衡趋于完美。你也许在家族企业、居家办公或者团队中找到了一种归属感。",
        "advice": "情感的圆满是你一路走来所有选择的回报。好好享受这份幸福，同时也把爱传递出去。",
        "up_EN": "Emotional fulfillment and family happiness have reached their peak. This is a phase filled with love and harmony — you feel that you truly belong somewhere. Family relationships, intimacy, and inner peace have all reached an ideal state.",
        "rev_EN": "Disharmony in the family or broken relationships have left you feeling a loss of belonging. You need to repair the connections with your family members.",
        "love_EN": "Your romantic relationship has reached fulfillment at the marriage or family level. This is an ideal time to build a warm home — emotional commitment is deepening.",
        "career_EN": "The balance between work and family is approaching perfection. You may have found a sense of belonging in a family business, remote work, or within your team.",
        "advice_EN": "Emotional fulfillment is the reward for all the choices you've made along the way. Enjoy this happiness fully, and also pass the love forward."
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "温柔的灵感和直觉信息正在流向你。一个情感上的新开始——可能是一段新的感情萌芽，或者创意灵感在你心中涌动。保持敏感和接收状态。",
        "rev": "情绪化的波动让你难以保持稳定。创意受阻或感情上的不成熟正在制造麻烦。需要有更多的自我觉察。",
        "love": "一段温柔的新恋情可能在萌芽。或者你收到了来自心仪对象的情感信号。保持接收的心态，但不要过度解读。",
        "career": "创意灵感的初期阶段，适合构思新方案或计划。你的直觉在工作中会发挥重要作用。",
        "advice": "敏感是一种超能力，但需要智慧来驾驭。保持心的敏锐，同时保持心智的清醒。",
        "up_EN": "Gentle inspiration and intuitive messages are flowing toward you. An emotional new beginning — perhaps a new romance budding, or creative inspiration stirring in your heart. Stay sensitive and receptive.",
        "rev_EN": "Emotional fluctuations are making it hard to stay stable. Creative blocks or emotional immaturity are causing trouble. Greater self-awareness is needed.",
        "love_EN": "A gentle new romance may be budding. Or you've received emotional signals from someone you're interested in. Stay receptive, but don't over-interpret.",
        "career_EN": "The early stage of creative inspiration — ideal for conceptualizing new plans or projects. Your intuition will play an important role at work.",
        "advice_EN": "Sensitivity is a superpower, but it needs wisdom to be wielded. Keep your heart sharp while keeping your mind clear."
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "浪漫的追求者——你或你生活中的某人正在展示迷人的魅力和理想的爱情。举止优雅、充满激情，但需要确认这种热情是否持久。",
        "rev": "花心或不切实际的浪漫幻想正在浪费你的时间和感情。表面迷人的东西可能缺乏实质。需要警惕那些只说不做的人。",
        "love": "浪漫的追求期——你可能是追求者也可能是被追求者。爱情的氛围浓厚，但需要确认这不仅仅是瞬间的化学反应。",
        "career": "带着理想主义投入工作，适合需要创意和审美能力的领域。但需要注意不要因为理想化而忽视实际问题。",
        "advice": "浪漫是最美的糖衣，但持久的爱情需要更多——承诺、理解和共同的成长。",
        "up_EN": "A romantic pursuer — you or someone in your life is displaying captivating charm and idealized love. Elegant, passionate, but you need to confirm whether this enthusiasm will last.",
        "rev_EN": "Fickleness or unrealistic romantic fantasies are wasting your time and feelings. What looks charming on the surface may lack substance. Beware of those who only talk and never act.",
        "love_EN": "A period of romantic pursuit — you may be the pursuer or the pursued. The atmosphere of romance is strong, but you need to confirm this is more than just momentary chemistry.",
        "career_EN": "Bringing idealism to work — suited for fields requiring creativity and aesthetic ability. But be careful not to overlook practical issues due to idealization.",
        "advice_EN": "Romance is the sweetest sugar coating, but lasting love requires much more — commitment, understanding, and growing together."
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "你正在展现出最高级的同理心和直觉力。像温柔的月亮一样，你能够滋养周围的人，同时保持着深刻的直觉洞察。情感智慧是你的超能力。",
        "rev": "情绪过度依赖他人，或者因为缺乏边界而感到疲惫。过度敏感让你失去了内在的中心。需要建立情感上的独立性。",
        "love": "在感情中展现出极高的情商和滋养力。你懂得如何爱人和被爱，是伴侣的精神港湾。",
        "career": "职场中的情感智慧得到发挥——也许是HR、心理咨询、创意或任何需要与人深度连接的领域。",
        "advice": "你不需要吸收所有人的情绪——共情不是同情。保持你的温柔，同时守护你的边界。",
        "up_EN": "You are displaying the highest level of empathy and intuition. Like a gentle moon, you can nourish those around you while maintaining profound intuitive insight. Emotional intelligence is your superpower.",
        "rev_EN": "Over-dependence on others emotionally, or exhaustion from lacking boundaries. Excessive sensitivity has caused you to lose your inner center. You need to establish emotional independence.",
        "love_EN": "You display high emotional intelligence and nurturing ability in love. You know how to love and be loved — you are a spiritual harbor for your partner.",
        "career_EN": "Your emotional intelligence is shining in the workplace — perhaps in HR, counseling, creative work, or any field requiring deep human connection.",
        "advice_EN": "You don't need to absorb everyone's emotions — empathy is not sympathy. Keep your gentleness while guarding your boundaries."
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "情感上达到成熟的顶峰。你能够包容和理解他人，同时保持内在的稳定。艺术鉴赏力和情感智慧都处于最高水平。",
        "rev": "情感上的冷漠或者通过操纵他人的情绪来达到目的。压抑自己的情感表达，用理智的高墙隔绝内心。",
        "love": "感情中的成熟伴侣——你能够给予安全感和理解，是值得信赖的情感依托。",
        "career": "适合担任需要情感智慧和稳定性的领导角色。你的判断力兼具理智和情感的深度。",
        "advice": "真正的王者不是没有情感，而是能够驾驭情感的海洋而不被淹没。",
        "up_EN": "You have reached the peak of emotional maturity. You can accept and understand others while maintaining inner stability. Both artistic appreciation and emotional wisdom are at their highest level.",
        "rev_EN": "Emotional coldness, or manipulating others' emotions to achieve your goals. You're suppressing your emotional expression, using a high wall of rationality to isolate your heart.",
        "love_EN": "A mature partner in love — you can provide security and understanding, and are a trustworthy emotional anchor.",
        "career_EN": "Suited for leadership roles requiring emotional intelligence and stability. Your judgment combines the depth of both reason and emotion.",
        "advice_EN": "A true king is not one without emotions, but one who can navigate the ocean of emotions without being drowned by them."
      }
    ]
  },
  {
    "suit": "宝剑",
    "en": "Swords",
    "element": "风",
    "theme": "思想、沟通、挑战、真理",
    "theme_en": "Thought, Communication, Challenge, Truth",
    "cards": [
      {
        "rank": "王牌",
        "en": "Ace",
        "up": "真理的利剑劈开了迷雾——一个清晰的洞见或突破性的想法正在降临。思维高度锐利，适合做重大决策。追求真相，不管它多不舒服。",
        "rev": "思维混乱，真相被遮蔽。你可能收到错误信息或者被自己的偏见蒙蔽。在做出重大决定前，先确认事实。",
        "love": "感情中需要坦诚沟通。也许是一个重要的对话即将发生，真相可能会刺破舒适的幻象，但长期来看是有益的。",
        "career": "突破性的想法或解决方案即将出现。清晰的思维和果断的沟通能力是你的利器。适合做重要决策。",
        "advice": "真相比舒适更珍贵。你此刻拥有看清事物本质的能力——不要放弃这个天赋。",
        "up_EN": "The sword of truth has cut through the fog — a clear insight or breakthrough idea is descending. Your mind is exceptionally sharp, ideal for making major decisions. Pursue the truth, no matter how uncomfortable.",
        "rev_EN": "Thinking is muddled, and the truth is obscured. You may be receiving wrong information or blinded by your own biases. Verify the facts before making any major decisions.",
        "love_EN": "Honest communication is needed in your relationship. Perhaps an important conversation is approaching — the truth may pierce comfortable illusions, but it is beneficial in the long run.",
        "career_EN": "A breakthrough idea or solution is about to emerge. Clear thinking and decisive communication are your sharpest tools. Ideal for making important decisions.",
        "advice_EN": "Truth is more precious than comfort. You have the ability right now to see through to the essence of things — don't give up this gift."
      },
      {
        "rank": "二",
        "en": "2",
        "up": "你正处在两难抉择的十字路口。两种选择各有优劣，让你陷入僵局。信息似乎都不够充分，需要更多的内心指引才能做出明智决定。",
        "rev": "错误的选择或逃避让你陷入了更深的困境。信息过载加重了焦虑，你可能已经做出了一个不明智的决定。",
        "love": "感情中的两难——两段关系的取舍，或者关系中某个无法回避的艰难选择。拖延只会让情况恶化。",
        "career": "职业选择的关键时刻。两份工作、两个方向，你需要权衡利弊做出决定。信息已经足够，不要再等。",
        "advice": "当理性无法抉择时，跟随你的直觉。平衡的假象不如一个坚定的选择重要。",
        "up_EN": "You stand at a crossroads of a difficult choice. Two options each have pros and cons, leaving you in a stalemate. Information seems insufficient — you need more inner guidance to make a wise decision.",
        "rev_EN": "A wrong choice or avoidance has pushed you into a deeper dilemma. Information overload is worsening your anxiety — you may have already made an unwise decision.",
        "love_EN": "A dilemma in love — choosing between two relationships, or an unavoidable difficult decision within your current one. Procrastination will only make things worse.",
        "career_EN": "A critical moment for career choice. Two jobs, two directions — you need to weigh the pros and cons and decide. You have enough information — don't wait any longer.",
        "advice_EN": "When reason can't decide, follow your intuition. The illusion of balance is less important than a firm decision."
      },
      {
        "rank": "三",
        "en": "3",
        "up": "心碎、背叛、悲伤——这是宝剑牌组中最痛苦的一张。你的心正在经历一场暴雨。但请记住：这场风暴会过去，而你会比之前更强大。",
        "rev": "你正在从痛苦中恢复。虽然伤口还在隐隐作痛，但你已经能够释怀并向前看。治愈正在发生。",
        "love": "感情中的心碎——背叛、分离或深刻的失望。允许自己哀伤，但不要陷入自怜。时间是治愈的良药。",
        "career": "工作中可能经历了背叛或重大挫折。但这次痛苦会带给你重要的教训。有些人的离开是为了给你更好的让路。",
        "advice": "允许自己崩溃一会儿。悲伤不是软弱——它是你灵魂的暴雨，冲刷过后才会有彩虹。",
        "up_EN": "Heartbreak, betrayal, sorrow — this is the most painful card in the suit of Swords. Your heart is going through a storm. But remember: this storm will pass, and you will emerge stronger than before.",
        "rev_EN": "You are recovering from the pain. Though the wound still aches, you are already able to release and move forward. Healing is happening.",
        "love_EN": "Heartbreak in love — betrayal, separation, or profound disappointment. Allow yourself to grieve, but don't sink into self-pity. Time is the best medicine for healing.",
        "career_EN": "You may have experienced betrayal or a major setback at work. But this pain will bring you important lessons. Some people leave to make way for something better.",
        "advice_EN": "Allow yourself to break down for a moment. Sadness is not weakness — it's the storm of your soul, and only after it washes through can a rainbow appear."
      },
      {
        "rank": "四",
        "en": "4",
        "up": "你需要彻底的休息和恢复。精神和身体的双重疲惫告诉你该暂停了。暂时从外界的纷扰中隐退，给自己充电的空间。",
        "rev": "焦躁不安让你无法好好休息。虽然身体躺在床上，但脑子还在高速运转。真正的休息不仅需要身体的静止，更需要心智的宁静。",
        "love": "感情中的冷静期。也许需要暂时的空间来整理自己的情绪和想法。距离不是疏远，而是为了更好地靠近。",
        "career": "工作上的倦怠需要被正视。强制性的休息比持续消耗更有效率。给自己放一个假，回来时你会更有力量。",
        "advice": "休息不是浪费时间，而是投资自己。在寂静中，你才能听到下一个阶段的召唤。",
        "up_EN": "You need complete rest and recovery. The dual exhaustion of mind and body is telling you to pause. Temporarily withdraw from the world's noise and give yourself space to recharge.",
        "rev_EN": "Restlessness prevents you from truly resting. Though your body lies in bed, your mind races at full speed. True rest requires not just physical stillness, but mental tranquility.",
        "love_EN": "A cooling-off period in your relationship. Perhaps you need temporary space to sort through your emotions and thoughts. Distance is not estrangement — it's for drawing closer in a better way.",
        "career_EN": "Workplace burnout needs to be acknowledged. Mandatory rest is more efficient than continuous depletion. Give yourself a break — you'll return with greater strength.",
        "advice_EN": "Rest is not wasting time — it's investing in yourself. Only in stillness can you hear the call of the next phase."
      },
      {
        "rank": "五",
        "en": "5",
        "up": "你在冲突中可能落败了，但这只是一种消极的胜利——对方可能赢得并不光彩。评估这场冲突：你失去了什么？你又从中学到了什么？",
        "rev": "从冲突中学习和和解。你能够放下怨恨，看到冲突背后的教训。和解比胜利更有价值。",
        "love": "感情中的争执和冲突可能以你的不情愿让步而告终。问自己：赢不了的人是你，还是硬要赢的对方？",
        "career": "职场竞争中的挫折。同事或竞争者可能用不公平的方式胜出。不要降低自己的标准——实力终会被看到。",
        "advice": "有些胜利是带着苦味的。在冲突中保持自己的尊严比赢得争吵重要得多。",
        "up_EN": "You may have been defeated in this conflict, but it's a hollow victory for the other side — they may not have won honorably. Assess this conflict: what did you lose? And what did you learn from it?",
        "rev_EN": "Learning and reconciling from the conflict. You can let go of resentment and see the lesson behind the clash. Reconciliation is more valuable than victory.",
        "love_EN": "Arguments and conflicts in love may end with your reluctant concession. Ask yourself: is it you who can't win, or is it them who insists on winning at all costs?",
        "career_EN": "A setback in workplace competition. Colleagues or competitors may have won through unfair means. Don't lower your standards — your true ability will eventually be seen.",
        "advice_EN": "Some victories come with a bitter aftertaste. Maintaining your dignity in conflict is far more important than winning the argument."
      },
      {
        "rank": "六",
        "en": "6",
        "up": "你正在离开困境，走向光明的彼岸。这是一个过渡时期，虽然身后还有未了之事，但你的船已经掉转了方向。新的开始正在地平线上显现。",
        "rev": "你被困在原地，拒绝改变。远离问题的机会就在眼前，但你的恐惧让你无法启航。需要看到更大的图景。",
        "love": "一段感情的过渡期——你正在从过去的伤痛中走出来，驶向新的情感风景。路途可能孤单，但方向是正确的。",
        "career": "职业转变的过渡期。你可能正在离开旧岗位、旧公司或旧行业，走向新的方向。这段路上的不确定性是暂时的。",
        "advice": "你不需要看到整条路才能启程，只需看到前面一步的亮光。过渡不是终点，而是抵达前的必经之路。",
        "up_EN": "You are leaving troubled waters behind and sailing toward brighter shores. This is a transitional period — though unfinished business remains behind you, your boat has already turned around. A new beginning is appearing on the horizon.",
        "rev_EN": "You're stuck in place, refusing to change. The opportunity to move away from the problem is right in front of you, but your fear prevents you from setting sail. You need to see the bigger picture.",
        "love_EN": "A transitional period in love — you are emerging from past pain and sailing toward new emotional landscapes. The journey may feel lonely, but the direction is correct.",
        "career_EN": "A transition period in your career. You may be leaving an old position, company, or industry, heading toward a new direction. The uncertainty on this path is temporary.",
        "advice_EN": "You don't need to see the entire road to set out — you only need to see the light one step ahead. Transition is not the destination — it's the necessary path before arrival."
      },
      {
        "rank": "七",
        "en": "7",
        "up": "巧妙和灵活的策略正在发挥作用。你不需要从正面进攻——暗中的布局、借力打力、灵活的应对才是制胜之道。保持低调，让结果说话。",
        "rev": "诡计暴露或弄巧成拙。你的算计被他人识破了。需要重新审视策略，更诚实一些才能达成目标。",
        "love": "感情中需要一些微妙的策略——不是操纵，而是懂得何时该说、何时该等。暗恋或有秘密的感情关系。",
        "career": "职场需要灵活应对——不是所有事情都要硬碰硬。暗中准备、寻找盟友、等待最佳时机——这些比硬扛更有智慧。",
        "advice": "柔能克刚。不战而屈人之兵是最高级的战略。保持你的秘密武器，在关键时刻才亮出来。",
        "up_EN": "Clever and flexible strategy is working. You don't need a frontal assault — behind-the-scenes arrangements, using leverage, and adaptive responses are the path to victory. Keep a low profile and let the results speak for themselves.",
        "rev_EN": "Your schemes have been exposed or backfired. Your calculations have been seen through by others. Reexamine your strategy — greater honesty is needed to achieve your goals.",
        "love_EN": "Subtle strategy is needed in love — not manipulation, but knowing when to speak and when to wait. A secret crush or a clandestine relationship.",
        "career_EN": "The workplace requires flexible maneuvering — not everything should be confronted head-on. Preparing quietly, finding allies, waiting for the right moment — these are wiser than pushing through forcefully.",
        "advice_EN": "Softness overcomes hardness. Defeating the opponent without fighting is the highest strategy. Keep your secret weapons and reveal them only at the critical moment."
      },
      {
        "rank": "八",
        "en": "8",
        "up": "你感到被困住了，但监狱的门其实是开着的。自我设限的想法让你看不到出路。重新评估你的假设，你的限制比你想象的要少得多。",
        "rev": "你正在释放自己，突破思维的牢笼。曾经的恐惧和限制正在被看清，你终于获得了自由思考的能力。",
        "love": "感情中的被困感——你或许觉得离不开一个人、一段关系，但实际上你比想象中更有选择。",
        "career": "职业上的无力感。你觉得自己别无选择，但其实是你选择了不选择。重新审视你的能力和市场价值。",
        "advice": "你唯一的监狱是你认为没有选择的那个想法。自由始于认知：你一直都有选择。",
        "up_EN": "You feel trapped, but the prison door is actually open. Self-limiting beliefs are blinding you to the way out. Reevaluate your assumptions — your limitations are far fewer than you imagine.",
        "rev_EN": "You are freeing yourself, breaking through the prison of your mind. The fears and limitations that once held you are being seen clearly — you have finally gained the ability to think freely.",
        "love_EN": "A feeling of being trapped in love — you may think you can't leave a person or a relationship, but in reality, you have more choices than you think.",
        "career_EN": "A sense of powerlessness in your career. You feel you have no options, but really you've chosen not to choose. Reevaluate your abilities and market value.",
        "advice_EN": "Your only prison is the belief that you have no choice. Freedom begins with recognition: you have always had a choice."
      },
      {
        "rank": "九",
        "en": "9",
        "up": "焦虑和恐惧在深夜啃噬你的心。你可能被过度担忧、失眠和负面思维困扰。但请认清：绝大多数的恐惧只是头脑的虚构，现实远没有你想的那么糟。",
        "rev": "你终于能够释然——那些纠缠你许久的恐惧正在消散。学会放手和信任，噩梦终将过去。",
        "love": "感情中的焦虑不安——可能是对关系的不确定性、对伴侣忠诚的怀疑，或者是对自己被抛弃的恐惧。需要区分直觉和焦虑。",
        "career": "工作压力导致的身心疲惫。你可能在担心失业、犯错或被替代。但你的恐惧往往比现实更大。",
        "advice": "你恐惧的不是事实，而是你编造的故事。深呼吸，看看窗外——世界并没有崩塌。",
        "up_EN": "Anxiety and fear are gnawing at your heart in the dark of night. You may be plagued by excessive worry, insomnia, and negative thoughts. But recognize this: the vast majority of your fears are fabrications of the mind — reality is far less dire than you imagine.",
        "rev_EN": "You are finally able to find relief — the fears that have haunted you for so long are dissipating. Learn to let go and trust. The nightmare will eventually pass.",
        "love_EN": "Anxiety and unease in love — perhaps about the uncertainty of the relationship, doubts about your partner's loyalty, or fear of being abandoned. You need to distinguish between intuition and anxiety.",
        "career_EN": "Physical and mental exhaustion from work pressure. You may be worried about losing your job, making mistakes, or being replaced. But your fears are often bigger than the reality.",
        "advice_EN": "What you fear is not the facts — it's the stories you've made up. Take a deep breath, look out the window — the world has not collapsed."
      },
      {
        "rank": "十",
        "en": "10",
        "up": "彻底的结束。痛苦的结局是不可避免的，但这也是触底反弹的时刻。你已经没什么可以失去了，从今往后只会好起来。",
        "rev": "拒绝结束带来持续的痛苦。你还在旧故事里挣扎，不接受已经结束的事实。放手是唯一的路。",
        "love": "一段感情的彻底终结。虽然痛苦，但结束意味着你可以重新开始。有些事到该结束的时候就是该结束了。",
        "career": "职业上的重大结束——离职、被裁或项目彻底终止。但结束不是失败，它是为新的机会腾出空间。",
        "advice": "有些结束不是惩罚，而是礼物。当一扇门关上时，别在走廊里站太久——转身看看窗户。",
        "up_EN": "A complete ending. The painful conclusion is inevitable, but this is also the moment of hitting bottom and bouncing back. You have nothing left to lose — from here on, it can only get better.",
        "rev_EN": "Refusing to end things brings ongoing suffering. You're still struggling in the old story, refusing to accept that it's over. Letting go is the only way.",
        "love_EN": "The definitive end of a relationship. Though painful, an ending means you can start anew. When something is time to end, it's time to end.",
        "career_EN": "A major ending in your career — resignation, layoff, or the complete termination of a project. But an ending is not failure — it's making space for new opportunities.",
        "advice_EN": "Some endings are not punishment, but gifts. When a door closes, don't stand in the hallway too long — turn around and look for a window."
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "旺盛的求知欲和敏锐的观察力是你当前的特点。新信息正在汇集，保持警觉和开放的心态去接收。像侦探一样去探索你感兴趣的领域。",
        "rev": "八卦和不经思考的言论正在制造麻烦。信息泄露或轻信谣言可能伤害你关心的人。管好自己的嘴巴。",
        "love": "感情中的观察和试探期。你在收集关于心仪对象的信息，或者通过对话了解更多。保持敏锐但不要多疑。",
        "career": "学习新技能的时期。可能在参加培训、学习技术或者研究新的职业方向。保持好奇心。",
        "advice": "知识是宝剑，但智慧在于如何使用它。你的求知欲是天赋，但需要加上审慎才能带来真正的力量。",
        "up_EN": "A strong thirst for knowledge and sharp observational skills define you right now. New information is gathering — stay alert and open-minded to receive it. Explore your areas of interest like a detective.",
        "rev_EN": "Gossip and thoughtless remarks are causing trouble. Information leaks or credulously believing rumors may harm those you care about. Watch your mouth.",
        "love_EN": "A period of observation and testing in love. You're gathering information about the person you're interested in, or learning more through conversation. Stay sharp but don't become paranoid.",
        "career_EN": "A period of learning new skills. You may be in training, studying technology, or researching new career directions. Stay curious.",
        "advice_EN": "Knowledge is a sword, but wisdom lies in how you use it. Your thirst for knowledge is a gift, but it needs prudence to bring true power."
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "你正在果敢地冲向真理的战场。言辞犀利、思维敏锐、行动迅速——你是一个不容小觑的对手。但记住：速度需要有方向才有意义。",
        "rev": "冲动的言论和好斗的姿态正在破坏关系。你可能说话太伤人、做事太急切。学会在说话前数到三。",
        "love": "感情中的冲突可能一触即发。你的言辞可能过于犀利，伤害到在乎的人。在表达不满时记得留有余地。",
        "career": "工作中需要果断决策和迅速行动。你的能力和态度都很强，但需注意不要用对抗代替沟通。",
        "advice": "最快的剑不一定是最好用的。真正的力量在于控制——知道何时出剑，更知道何时收剑。",
        "up_EN": "You are boldly charging into battle for the truth. Sharp-tongued, keen-minded, and swift in action — you are a formidable opponent. But remember: speed only matters when you have direction.",
        "rev_EN": "Impulsive remarks and a combative stance are damaging relationships. Your words may be too cutting, your actions too hasty. Learn to count to three before speaking.",
        "love_EN": "Conflict in love may be about to erupt. Your words may be too sharp and hurt those you care about. When expressing dissatisfaction, remember to leave room for reconciliation.",
        "career_EN": "Decisive decisions and swift action are needed at work. Your ability and attitude are strong, but be careful not to replace communication with confrontation.",
        "advice_EN": "The fastest sword is not necessarily the best to use. True power lies in control — knowing when to draw the sword, and even more, knowing when to sheathe it."
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "独立的思考和清晰的判断是你最珍贵的品质。你能在复杂的局面中保持理性，同时不失人情味。这是智慧与沉着的结合。",
        "rev": "过于冷漠和批判——你在用自己的标准衡量一切。过度的理性让你失去了温度。偶尔示弱也是一种力量。",
        "love": "感情中的独立和理性——你不会为了感情失去自我，但也需要学习在关系中柔化你的边界。",
        "career": "职场中的明智决策者。你能在压力下保持冷静和判断力，是团队中最值得信赖的理性声音。",
        "advice": "智慧不只是知道什么是对的，更是在对的时候用对的方式说出来。",
        "up_EN": "Independent thinking and clear judgment are your most precious qualities. You can remain rational in complex situations without losing your humanity. This is the union of wisdom and composure.",
        "rev_EN": "Overly cold and critical — you are measuring everything by your own standards. Excessive rationality has cost you your warmth. Showing vulnerability is also a form of strength.",
        "love_EN": "Independence and rationality in love — you won't lose yourself for a relationship, but you also need to learn to soften your boundaries within one.",
        "career_EN": "A wise decision-maker in the workplace. You can remain calm and clear-headed under pressure, and are the team's most trusted voice of reason.",
        "advice_EN": "Wisdom is not just knowing what is right — it's saying it at the right time and in the right way."
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "权威的智慧和公正的决断力正在你身上展现。你具备最高的逻辑思维能力和领导判断力。一个真正的智者和领袖。",
        "rev": "专制和冷酷——你正在用智慧作为武器去控制他人。过度强调逻辑而忽视情感，让你在人际关系中显得高高在上。",
        "love": "感情中展现出理性和智慧的掌控力。你能够帮助伴侣理清思绪，但不要让自己变成法官而非恋人。",
        "career": "职业生涯的智慧巅峰。你具备成为行业权威和资深专家的一切条件。你的判断被广泛尊重。",
        "advice": "真正的智慧是知道自己有局限。最伟大的君王不是从不犯错，而是能够听取逆耳之言。",
        "up_EN": "Authoritative wisdom and fair decisiveness are manifesting through you. You possess the highest capacity for logical thinking and leadership judgment. A true sage and leader.",
        "rev_EN": "Tyranny and coldness — you are using intellect as a weapon to control others. Over-emphasizing logic while neglecting emotion makes you seem aloof in interpersonal relationships.",
        "love_EN": "You demonstrate rational and wise control in love. You can help your partner sort through their thoughts, but don't let yourself become a judge instead of a lover.",
        "career_EN": "The wisdom peak of your career. You have all the conditions to become an industry authority and senior expert. Your judgment is widely respected.",
        "advice_EN": "True wisdom is knowing your own limitations. The greatest ruler is not one who never errs, but one who can listen to unwelcome advice."
      }
    ]
  },
  {
    "suit": "星币",
    "en": "Pentacles",
    "element": "土",
    "theme": "财富、工作、健康、物质",
    "theme_en": "Wealth, Work, Health, Material",
    "cards": [
      {
        "rank": "王牌",
        "en": "Ace",
        "up": "一扇财富和机遇的大门正在你面前打开。新的投资机会、收入来源或物质上的好运正在降临。脚踏实地去把握——这是你靠实力赢得的机会。",
        "rev": "错失良机或投资失利。财富的种子没有发芽，可能是因为土壤还没准备好。拖延或贪婪会让你错过窗口。",
        "love": "一段稳定且有物质基础的感情机会。金钱不是爱情的全部，但共同的财务目标能让关系更稳固。",
        "career": "职业上的黄金机会——跳槽、升职、创业或重大项目的启动。这是实质性的进步，不是画大饼。",
        "advice": "财富之门的钥匙一直在你手中。不要等待一个'完美'的时机——种下种子，然后耐心浇灌。",
        "up_EN": "A door of wealth and opportunity is opening before you. New investment opportunities, income streams, or material blessings are arriving. Stay grounded and seize them — this is an opportunity you've earned through your abilities.",
        "rev_EN": "Missed opportunities or investment losses. The seeds of wealth haven't sprouted, perhaps because the soil wasn't ready yet. Procrastination or greed may cause you to miss the window.",
        "love_EN": "A stable relationship opportunity with material foundations. Money isn't everything in love, but shared financial goals can make the relationship more solid.",
        "career_EN": "A golden career opportunity — job change, promotion, entrepreneurship, or launching a major project. This is substantive progress, not empty promises.",
        "advice_EN": "The key to the door of wealth has always been in your hand. Don't wait for a 'perfect' moment — plant the seed, then water it patiently."
      },
      {
        "rank": "二",
        "en": "2",
        "up": "你正在多个财务或工作任务之间巧妙地保持平衡。这是灵活调配资源的能力。像一个杂技演员一样，你能同时处理多项事务而不乱。",
        "rev": "财务失衡或分身乏术。你承担了太多，却没有足够的精力去做好每一件事。需要优先排序并学会拒绝。",
        "love": "感情和工作之间的平衡是当前的课题。你需要在爱情和生活中找到一个可持续的节奏。",
        "career": "同时在处理多个项目或收入来源。灵活性和适应力是你的优势，但也要防止过度分散精力。",
        "advice": "平衡不是静止的——它是在不断的微调中保持不倒下。欣赏自己已经做到的成就。",
        "up_EN": "You are skillfully maintaining balance between multiple financial or work tasks. This is the ability to flexibly allocate resources. Like a juggler, you can handle multiple matters simultaneously without dropping anything.",
        "rev_EN": "Financial imbalance or being stretched too thin. You've taken on too much without enough energy to do everything well. You need to prioritize and learn to say no.",
        "love_EN": "The balance between love and work is the current lesson. You need to find a sustainable rhythm between your relationship and your life.",
        "career_EN": "You're handling multiple projects or income sources at once. Flexibility and adaptability are your strengths, but guard against spreading yourself too thin.",
        "advice_EN": "Balance is not static — it's the constant fine-tuning that keeps you from falling. Appreciate what you've already achieved."
      },
      {
        "rank": "三",
        "en": "3",
        "up": "团队合作正在结出硕果。你的专业技能得到认可，合作项目顺利推进。这是协作和共享成功的阶段。",
        "rev": "合作失败或技能不足导致项目受挫。也许你和团队的目标不一致，或者你需要进一步打磨自己的专业技能。",
        "love": "通过共同的兴趣或项目建立联系。一段建立在共同价值观和务实基础之上的关系。",
        "career": "职业认证、技能提升和团队合作的关键期。你的专业能力正在得到正式的认可。",
        "advice": "单打独斗成就有限。找到那些和你有共同愿景的人——合作能将你的能力放大数倍。",
        "up_EN": "Teamwork is bearing fruit. Your professional skills are being recognized, and collaborative projects are progressing smoothly. This is a phase of cooperation and shared success.",
        "rev_EN": "Failed collaboration or insufficient skills have set back the project. Perhaps your goals and the team's are misaligned, or you need to further hone your professional abilities.",
        "love_EN": "Building a connection through shared interests or projects. A relationship built on common values and a pragmatic foundation.",
        "career_EN": "A critical period for professional certification, skill enhancement, and teamwork. Your professional competence is receiving formal recognition.",
        "advice_EN": "Going it alone yields limited results. Find those who share your vision — collaboration can amplify your abilities many times over."
      },
      {
        "rank": "四",
        "en": "4",
        "up": "财务基础稳固，储蓄在增加，你对物质资源的掌控力很强。这是经济安全感的建设期。但要注意：过度节省会变成吝啬。",
        "rev": "对金钱的控制欲过强——可能是吝啬或恐惧财务损失。抓住手中的钱不放，也拒绝了金钱的流通。",
        "love": "感情中可能过于注重物质安全而忽略了情感的流动。金钱上的控制欲也可能影响关系。",
        "career": "职业稳定，收入有保障。现在不适合冒险——先巩固已有的基础。但不要让安逸变成保守。",
        "advice": "财务安全是必要的，但金钱只是工具不是目的。你抓住的钱越多，能流动进来的就越少。",
        "up_EN": "Your financial foundation is solid, savings are growing, and you have strong control over material resources. This is a period of building economic security. But be careful: excessive frugality can become miserliness.",
        "rev_EN": "An excessive need to control money — perhaps miserliness or a fear of financial loss. Holding tightly onto your money also blocks its circulation.",
        "love_EN": "In love, you may focus too much on material security while neglecting emotional flow. Financial control issues can also affect the relationship.",
        "career_EN": "Your career is stable and your income is secure. Now is not the time for risk-taking — first consolidate your existing foundation. But don't let comfort become complacency.",
        "advice_EN": "Financial security is necessary, but money is only a tool, not the goal. The more money you clutch tightly, the less can flow in."
      },
      {
        "rank": "五",
        "en": "5",
        "up": "财务困难或物质上的匮乏正在考验你。你可能感到被孤立或雪上加霜。但请看清：你周围的资源比你意识到的多——向外寻求帮助。",
        "rev": "你正在恢复，找到帮助和走出贫困的路径。境况正在好转，你不再是一个人。",
        "love": "感情中因为物质问题发生摩擦。财务方面的压力正在影响关系。记住你们是队友，不是对手。",
        "career": "职业或收入上的低谷期。但这只是暂时的——你的价值不因暂时的困难而降低。主动寻求支援。",
        "advice": "在最低落的时候，最难的是开口说'我需要帮助'。但你不需要一个人扛——伸出手。",
        "up_EN": "Financial difficulty or material scarcity is testing you. You may feel isolated or that troubles are piling on. But see clearly: there are more resources around you than you realize — reach out for help.",
        "rev_EN": "You are recovering and finding paths to help and lift yourself out of scarcity. The situation is improving, and you are no longer alone.",
        "love_EN": "Friction in love due to material issues. Financial pressure is affecting the relationship. Remember you are teammates, not opponents.",
        "career_EN": "A low point in your career or income. But this is only temporary — your value is not diminished by temporary hardship. Take the initiative to seek support.",
        "advice_EN": "At your lowest, the hardest thing is to say 'I need help.' But you don't have to carry it all alone — reach out your hand."
      },
      {
        "rank": "六",
        "en": "6",
        "up": "慷慨的给予和资源的分享——你正处在能够帮助他人的位置上。也许是慈善捐助，也许是知识经验的分享。给出的都会以某种方式回来。",
        "rev": "在接受施舍的被动位置——权力的不对等让你不舒服。或者你有能力帮别人却在吝啬。",
        "love": "感情中的付出与接受达到了健康的平衡。你愿意为伴侣付出，也懂得接受对方的爱。",
        "career": "在工作中分享资源和机会，也许是在指导新人或回馈行业社区。善意的付出会扩大你的影响力。",
        "advice": "你给出的每一颗星币，都会在宇宙的账簿中刻下印记。真正的富有不是你拥有什么，而是你给出什么。",
        "up_EN": "Generous giving and sharing of resources — you are in a position to help others. Perhaps charitable donations, or sharing knowledge and experience. What you give will return to you in some form.",
        "rev_EN": "In a passive position of receiving charity — the power imbalance makes you uncomfortable. Or you have the ability to help others but are being stingy.",
        "love_EN": "A healthy balance of giving and receiving has been achieved in love. You are willing to give to your partner, and you also know how to receive their love.",
        "career_EN": "Sharing resources and opportunities at work — perhaps mentoring newcomers or giving back to the industry community. Generous giving will expand your influence.",
        "advice_EN": "Every coin you give leaves a mark in the universe's ledger. True wealth is not what you possess, but what you give."
      },
      {
        "rank": "七",
        "en": "7",
        "up": "耐心等待你的投资和努力结出果实。这是一个评估进展的阶段——看看哪些已经成熟，哪些还需要更多时间。不急不躁的态度是最有价值的心态。",
        "rev": "对进展的焦虑让你失去了耐心。你急于看到结果，但这种急躁可能导致错误的判断。成长需要时间。",
        "love": "感情需要时间的浇灌——你不能催促一段关系的发展。耐心观察，看看这段关系是否值得继续投入。",
        "career": "长期职业投资的评估期。你之前种下的种子哪些快要收成了？哪些需要重新调整？",
        "advice": "种下一棵树最好的时间是十年前，其次是现在。有些成果需要时间——等待也是投资的一部分。",
        "up_EN": "Patiently wait for your investments and efforts to bear fruit. This is a phase of assessing progress — see what has matured and what still needs more time. A calm and unhurried attitude is your most valuable mindset.",
        "rev_EN": "Anxiety about progress has eroded your patience. You're eager to see results, but this impatience may lead to poor judgment. Growth takes time.",
        "love_EN": "Love needs time to grow — you cannot rush a relationship's development. Patiently observe and see if this relationship is worth continued investment.",
        "career_EN": "An assessment period for long-term career investments. Which seeds you planted earlier are nearly ready for harvest? Which ones need readjustment?",
        "advice_EN": "The best time to plant a tree was ten years ago. The second best time is now. Some results take time — waiting is part of the investment."
      },
      {
        "rank": "八",
        "en": "8",
        "up": "勤奋和专注正在打磨你的技能。日复一日的努力虽然枯燥，但它是通向精通的唯一道路。你正在成为自己领域的高手。",
        "rev": "敷衍了事或缺乏动力的状态。你不投入，不思考，只是在走流程。这种状态持续下去会吞噬你的前途。",
        "love": "感情需要日复一日的用功——不是大张旗鼓的表白，而是每天的点滴关心和投入。",
        "career": "职业技能的精进期。适合学习新技能、考证、或者深度打磨专业能力。一万小时定律——投入就是你最大的竞争力。",
        "advice": "成功没有捷径。每天的微小进步，累积起来就是别人望尘莫及的高度。",
        "up_EN": "Diligence and focus are honing your skills. Day-after-day effort may be tedious, but it's the only path to mastery. You are becoming an expert in your field.",
        "rev_EN": "A state of going through the motions or lacking motivation. You're not invested, not thinking, just following the process. If this continues, it will consume your future.",
        "love_EN": "Love requires daily effort — not grand gestures, but small everyday care and investment.",
        "career_EN": "A period of refining professional skills. Ideal for learning new skills, getting certified, or deeply sharpening your professional abilities. The 10,000-hour rule — dedication is your greatest competitive edge.",
        "advice_EN": "There are no shortcuts to success. The tiny daily improvements accumulate into a height that others can only gaze up at from afar."
      },
      {
        "rank": "九",
        "en": "9",
        "up": "独立和富足——你正在享受自己努力换来的成果。财务自由、专业技能被认可、生活品质优良。这是自给自足的丰盛状态。",
        "rev": "过度依赖他人的经济支持，或者因为挥霍无度而失去了之前积累的成果。需要重新建立财务独立。",
        "love": "感情中的独立和自信。你不需要依附于任何人来获得安全感——这本身就是一种魅力。",
        "career": "职业上的自给自足。你也许在自由职业、创业或达到了较高的专业级别。享受独立的状态。",
        "advice": "真正的富足是你能够独立地生活，优雅地给予，而不需要依赖任何人。你做到了。",
        "up_EN": "Independence and abundance — you are enjoying the fruits of your hard work. Financial freedom, recognized professional skills, excellent quality of life. This is the abundant state of self-sufficiency.",
        "rev_EN": "Over-dependence on others' financial support, or squandering what you previously accumulated through extravagance. You need to reestablish financial independence.",
        "love_EN": "Independence and confidence in love. You don't need to attach yourself to anyone to feel secure — this in itself is a form of attractiveness.",
        "career_EN": "Self-sufficiency in your career. You may be freelancing, running a business, or have reached a senior professional level. Enjoy this state of independence.",
        "advice_EN": "True abundance is being able to live independently and give gracefully, without needing to depend on anyone. You've achieved it."
      },
      {
        "rank": "十",
        "en": "10",
        "up": "家族财富、遗产继承和长期的繁荣。你正在享受代代相传的成果，或者为自己家族的未来打下了坚实的基础。这是最长久的富足。",
        "rev": "家族纠纷或财富传承出现问题。继承权、遗产分配或家庭企业的矛盾让你既疲惫又无奈。",
        "love": "感情中考虑长远规划——婚姻、家庭、共同的财产和未来。你和伴侣正在为共同的家族打下基石。",
        "career": "事业进入长期稳定繁荣的阶段。你正在为退休、遗产或下一个世代积累资源。考虑更长远的布局。",
        "advice": "真正的遗产不是你留下的金钱，而是你这一生的作为对后世的影响。",
        "up_EN": "Family wealth, inheritance, and long-term prosperity. You are enjoying the fruits passed down through generations, or laying a solid foundation for your family's future. This is the most enduring form of abundance.",
        "rev_EN": "Family disputes or problems with wealth transfer. Conflicts over inheritance rights, estate distribution, or family business leave you both exhausted and helpless.",
        "love_EN": "Long-term planning in love — marriage, family, shared property, and future. You and your partner are laying the cornerstone for your shared family.",
        "career_EN": "Your career has entered a phase of long-term stability and prosperity. You are accumulating resources for retirement, legacy, or the next generation. Consider a longer-term strategy.",
        "advice_EN": "The true legacy you leave behind is not the money, but the impact your life's work has on future generations."
      },
      {
        "rank": "侍从",
        "en": "Page",
        "up": "务实的学习态度和对新技能的渴望。一个与金钱或职业相关的新机会正在萌芽——也许是实习、学徒或进修课程。",
        "rev": "懒散和缺乏上进心正在拖慢你。你不愿意为未来投资时间和精力，只想待在舒适区。",
        "love": "感情中的务实和默默付出。你可能在用实际行动而不是甜言蜜语来表达爱。",
        "career": "职业学习的起点——新的培训、技能课程或实习机会。这是打下基础的重要阶段。",
        "advice": "每一棵大树都是从一颗种子开始的。你现在学到的每一点知识，都是未来的财富。",
        "up_EN": "A pragmatic learning attitude and a thirst for new skills. A new opportunity related to money or career is budding — perhaps an internship, apprenticeship, or further study course.",
        "rev_EN": "Laziness and a lack of ambition are dragging you down. You're unwilling to invest time and energy in your future, preferring to stay in your comfort zone.",
        "love_EN": "Practicality and quiet dedication in love. You may be expressing your love through concrete actions rather than sweet words.",
        "career_EN": "The starting point of career learning — new training, skill courses, or internship opportunities. This is an important stage for laying the foundation.",
        "advice_EN": "Every great tree starts from a single seed. Every bit of knowledge you learn now is wealth for the future."
      },
      {
        "rank": "骑士",
        "en": "Knight",
        "up": "踏实可靠和勤奋努力是你当前的特质。你在稳步前进，如一头勤恳的牛。虽然不快，但每一步都扎实。",
        "rev": "拖延和停滞正在消磨你的机会。你可能过于谨慎或缺乏野心，让自己在原地踏步。",
        "love": "感情中的务实和专一——你是一个值得信赖的伴侣。虽然不浪漫，但你用行动证明了你的承诺。",
        "career": "事业上稳步推进。虽然没有大起大落，但这种稳定和踏实是你长期发展的保障。",
        "advice": "慢不是缺点——只要方向正确，每一步都在靠近目的地。坚持你目前的步伐。",
        "up_EN": "Steadiness, reliability, and diligent effort define you right now. You are advancing steadily, like a hardworking ox. Not fast, but every step is solid.",
        "rev_EN": "Procrastination and stagnation are eroding your opportunities. You may be overly cautious or lacking in ambition, keeping yourself stuck in place.",
        "love_EN": "Pragmatism and loyalty in love — you are a trustworthy partner. Though not the most romantic, you prove your commitment through actions.",
        "career_EN": "Steady progress in your career. Though there are no dramatic ups and downs, this stability and reliability are the foundation of your long-term development.",
        "advice_EN": "Slowness is not a flaw — as long as the direction is correct, every step brings you closer to the destination. Keep your current pace."
      },
      {
        "rank": "皇后",
        "en": "Queen",
        "up": "务实而温暖的财富管理者和滋养者。你不仅能够照顾好自己，还能滋养周围的人。实用的智慧加上丰盛的心态是你最大的财富。",
        "rev": "过度物质的倾向让你忽视了情感和精神的需要。可能因为过度消费或财务管理不善。",
        "love": "感情中的务实担当——你既能够给予伴侣物质上的安全感，又能用实际的行动表达爱。",
        "career": "职场中的实干家——你是团队中最可靠的那个人。财务管理和资源调配是你的强项。",
        "advice": "真正的丰盛是物质与精神的平衡。你拥有的不只是星币，更是滋养他人的能力。",
        "up_EN": "A pragmatic yet warm wealth manager and nurturer. You can not only take care of yourself, but also nourish those around you. Practical wisdom combined with an abundant mindset is your greatest asset.",
        "rev_EN": "An overly materialistic tendency has made you neglect emotional and spiritual needs. This may be due to excessive spending or poor financial management.",
        "love_EN": "A pragmatic pillar in love — you can give your partner material security while also expressing love through practical actions.",
        "career_EN": "A doer in the workplace — you are the most reliable person on the team. Financial management and resource allocation are your strengths.",
        "advice_EN": "True abundance is the balance between the material and the spiritual. What you possess is not just coins, but the ability to nourish others."
      },
      {
        "rank": "国王",
        "en": "King",
        "up": "财富和商业智慧的高度。你具备卓越的理财能力和商业头脑，是财富的大师。稳健和远见兼具，你正在进行大手笔的布局。",
        "rev": "贪婪和物质主义——你在用金钱的价值衡量一切。权力的腐败让你忘记了财富的真正意义。",
        "love": "感情中提供坚实的物质基础和安全感。但不要以为用钱可以买到一切——情感需要用心，不需要用钱。",
        "career": "商业和财富领域的巅峰。你具备企业家的远见和实力，适合大项目投资和资产管理。",
        "advice": "你是财富的主人，不是奴隶。真正的国王用财富编织未来，而不是被它编织。",
        "up_EN": "The height of wealth and business wisdom. You possess exceptional financial management ability and business acumen — a master of wealth. Both steady and visionary, you are making large-scale strategic moves.",
        "rev_EN": "Greed and materialism — you are measuring everything by monetary value. The corruption of power has caused you to forget the true meaning of wealth.",
        "love_EN": "Providing a solid material foundation and sense of security in love. But don't think money can buy everything — emotions require heart, not cash.",
        "career_EN": "The pinnacle in business and wealth. You possess the vision and capability of an entrepreneur — suited for large-scale project investment and asset management.",
        "advice_EN": "You are the master of wealth, not its slave. A true king weaves the future with wealth, rather than being woven by it."
      }
    ]
  }
];

var COMPASS_DIR_DATA_ZH = {
  '正东': {
    element:'木', trigram:'震位', imagery:'林木茂盛之地',
    '求财位': {
      today:'那本买回来只拆了塑封的书，往后读二十页。不是读完——二十页刚好够找回手感。',
      upcoming:'东方，林木茂盛之地。是留在现在的位置，还是去一个能长开的地方？你心里第一个跳出来的城市名——认真看它一眼。'
    },
    '贵人位': {
      today:'今天学一个你行业里的新词，用自己的话写一遍定义。不用发，自己看。',
      upcoming:'东方，震位——雷动之处。最近那件"再等等"的事，是在等时机还是等勇气？你其实知道。'
    },
    '桃花位': {
      today:'睡前不刷手机，刷三分钟牙。对着镜子站十秒——不干什么，就站。看见你自己。',
      upcoming:'东方，有风穿过的林木之间。你跟一个人待在一起的时候——是越来越像自己，还是越来越不像？'
    },
    '文昌位': {
      today:'还记得那只绿鸟吗，冷落它很久了。背五个单词，然后关掉——五个就够了，明天再来。',
      upcoming:'东方，震位属木。你最近在学的东西，是在长叶子还是长根？叶子好看，根才过冬。'
    }
  },
  '东南': {
    element:'木', trigram:'巽位', imagery:'风入之处',
    '求财位': {
      today:'翻出上个月的账单。不是焦虑——就看看钱流去了哪。不用改，先看。',
      upcoming:'东南，巽为风——风带来消息也带来过客。最近一笔收入之外的机会，你闻到了吗？'
    },
    '贵人位': {
      today:'给一个你欣赏但不太熟的人发条消息。不用写太长——就一句：最近在做什么有意思的事。',
      upcoming:'东南，风入之处。旗子动了不是旗子厉害，是风。谁在帮你——你看清楚了吗？'
    },
    '桃花位': {
      today:'打开那部标记了"想看"但一直没看的电影。别看解说，看原片。两个小时的完整叙事——今晚不开倍速。',
      upcoming:'东南，近水而热闹的地方。是一个很久没联系但不时想起的名字，还是总在同一个地方遇见的陌生面孔？哪个先冒出来，你心里有数。'
    },
    '文昌位': {
      today:'今天学的东西，用你自己的话讲给一个人听。讲不通的地方，就是你没真懂的地方。',
      upcoming:'东南，巽位。风不挑方向，但你知道自己该往哪吹。最近在学的——是别人让你学的，还是你自己想知道的？'
    }
  },
  '正南': {
    element:'火', trigram:'离位', imagery:'人声鼎沸之地',
    '求财位': {
      today:'一件闲置超过半年的东西，挂到二手平台。火星要溅出去才燃得起来。',
      upcoming:'南方，离为火，明亮处有阴影。你现在的收入来源——是在发光还是在耗光？'
    },
    '贵人位': {
      today:'站直。就现在，肩膀打开，深呼吸三次。姿势变了，气场跟着变。',
      upcoming:'南方，人声鼎沸之地。最近有没有一个你一直没去、又一直惦记的场合？答案快的那个，去。'
    },
    '桃花位': {
      today:'把微信头像换成你觉得最好看的那张。火需要被看见——先让你自己看见。',
      upcoming:'南方，离位。亮起来。你藏着的那个自己——有没有一个人是见过的？'
    },
    '文昌位': {
      today:'三分钟。就三分钟——打开那个你收藏了但一直没看的教程，只看第一节的开头。',
      upcoming:'南方，火象。兴趣这个东西，三分钟热度不是缺点——三分钟够烧开一壶水了。你上一次烧起来是什么时候？'
    }
  },
  '西南': {
    element:'土', trigram:'坤位', imagery:'厚德载物之处',
    '求财位': {
      today:'用手碰一样真的东西——木头、陶罐、石头。不是看，是碰。钱是虚的，触觉是真的。',
      upcoming:'西南，坤位。土不急着收成——你播下去的东西，季节到了自然有。现在是什么季节？'
    },
    '贵人位': {
      today:'今天做完一件事之后，不在脑子里过第二遍。做完就是做完了。',
      upcoming:'西南，坤位属土。大楼没人看地基，但盖楼的人自己知道。你最近做的工作——是往上盖还是在往下挖？'
    },
    '桃花位': {
      today:'今天给一个人真诚的夸奖。不是客气——是你真的觉得对方好的地方，说出来。',
      upcoming:'西南，厚德载物。舒服的关系不需要说明书，坐下去就知道了。你有没有哪里一直绷着？'
    },
    '文昌位': {
      today:'今天学一点明天忘一半也没关系。土不嫌慢——土什么都留得住。',
      upcoming:'西南，坤位。学东西最快的不是最聪明的，是最不急的。你在急什么？'
    }
  },
  '正西': {
    element:'金', trigram:'兑位', imagery:'精金锐气之所',
    '求财位': {
      today:'整理一个抽屉。只整理一个。扔掉明显没用的——剪刀用久了要磨，抽屉满了要清。',
      upcoming:'西方，兑位属金。金不藏——你手上有一件值钱但你一直没当回事的东西。是什么？'
    },
    '贵人位': {
      today:'今天有一句话该说了。你拖了多久？兑为口——说出来。',
      upcoming:'西方，锐气所聚。你现在做的这件事——是在磨刀还是在砍柴？磨刀不误砍柴工，但你多久没磨了？'
    },
    '桃花位': {
      today:'今天跟一个人说话的时候，看着对方的眼睛。不是盯，是停一秒。',
      upcoming:'西方，兑位。金声响亮——你欣赏一个人的时候，对方其实看出来了。你最近对谁藏着没说？'
    },
    '文昌位': {
      today:'删掉一个你根本不会看的收藏或课程。少即是多——删一个比加三个有用。',
      upcoming:'西方，金象。精不是多，是少而准。你最近学的东西——是广度够了还是深度不够？'
    }
  },
  '西北': {
    element:'金', trigram:'乾位', imagery:'天高云淡之处',
    '求财位': {
      today:'今天不花不必要的钱。不是省钱——是感受一下"不买"和"不缺"之间的区别。',
      upcoming:'西北，乾为天。天不下雨的时候你浇水也没用——有些收入是季节性的，急不来。现在是旱季还是雨季？'
    },
    '贵人位': {
      today:'出门前站直三秒，肩打开。姿势变了，运气会跟着变——乾卦的人走路带风。',
      upcoming:'西北，乾位，开阔高地。是继续待在这个位置，还是往更高处走？上个月睡不着的时候脑子里跳出来的那个念头——还在吗。'
    },
    '桃花位': {
      today:'今天一个人吃饭。不是孤独——是尝尝没人说话的时候，菜是什么味道。',
      upcoming:'西北，天高云淡。乾位的人容易先敬人后爱人——你最近遇到的人里，有一个值得你敬的吗？'
    },
    '文昌位': {
      today:'留意今天一个比你有经验的人说的话。就一句——然后想想这句话他为什么这么说。',
      upcoming:'西北，乾位。学什么都行，跟谁学才重要。你有没有一个真正意义上的引路人？'
    }
  },
  '正北': {
    element:'水', trigram:'坎位', imagery:'近水之地',
    '求财位': {
      today:'钱像水——今天只看不碰。看一遍余额，不用做什么，就看看。',
      upcoming:'北方，坎位近水。你在钱的方面——是越来越沉还是越来越浑？沉是积蓄，浑是消耗。哪个更接近你现在的状态？'
    },
    '贵人位': {
      today:'今天上班或学习的时候，每四十分钟起来走一圈。水要流动——人也一样。',
      upcoming:'北方，坎位。坎是坑也是井——往下挖的人，比往旁边跑的人先碰到水。你在挖还是在跑？'
    },
    '桃花位': {
      today:'今天听完一个人说话——不是准备回答，是听完。水最深的河，表面最安静。',
      upcoming:'北方，近水之地。一个人待着不是逃避——水面平静了才能映出东西。你现在映出来的是什么？'
    },
    '文昌位': {
      today:'读不进去的时候别硬读。换个地方——水换了杯子就换了味道。',
      upcoming:'北方，坎位属水。知识不灌进去，是浸润进去的。你最近是用灌的还是用浸的？'
    }
  },
  '东北': {
    element:'土', trigram:'艮位', imagery:'山止之处',
    '求财位': {
      today:'今天有一件事该停——一笔不必要的订阅、一个自动续费。关掉它。',
      upcoming:'东北，艮为山。山不长庄稼的地方，底下有矿。你一直以为没用的那部分——换个角度看过吗？'
    },
    '贵人位': {
      today:'如果最近太累——不是因为做得少，是因为方向多。今天划掉一个不重要的。',
      upcoming:'东北，艮位，山象。停下来不是退步，是换口气看看方向。你上一次停下来是什么时候？'
    },
    '桃花位': {
      today:'今天不主动找任何人。看看谁会先来找你——山不追人，人自己会来。',
      upcoming:'东北，山止之处。艮是止——有些关系要停下来才能看清。是你在追，还是你在被拽着走？'
    },
    '文昌位': {
      today:'背不进去的时候抄一遍。手比脑子慢，但手不会骗你。',
      upcoming:'东北，艮位。学到深处的人看起来都慢——山从来不急，但山一直在那里。你急什么？'
    }
  }
};

var COMPASS_DIR_DATA_EN = {
  East: {
    element: "Wood", trigram: "Zhen (Thunder)", imagery: "Lush woodlands",
    Wealth: { today: "That book you bought but only unwrapped — read twenty more pages. Not finish it — twenty pages is just enough to find your rhythm again.", upcoming: "East, where trees grow tall. Stay where you are, or go somewhere you can stretch? The first city that jumps to mind — take a real look at it." },
    Mentor: { today: "Learn one new term in your field today, and rewrite the definition in your own words. No need to share it — just for you.", upcoming: "East, Zhen — where thunder stirs. That thing you keep saying \"later\" about — are you waiting for timing or courage? You already know." },
    Romance: { today: "Before bed, put the phone down. Brush your teeth. Stand in front of the mirror for ten seconds — not to judge, just to see yourself.", upcoming: "East, where wind moves through trees. When you're with someone — do you become more yourself, or less?" },
    Wisdom: { today: "Remember that green bird? You've been ignoring it. Learn five new words — then stop. Five is enough. Come back tomorrow.", upcoming: "East, Zhen, of the Wood element. What you're learning lately — is it growing leaves or roots? Leaves look good, but roots survive winter." }
  },
  Southeast: {
    element: "Wood", trigram: "Xun (Wind)", imagery: "Where the wind enters",
    Wealth: { today: "Pull up last month's expenses. Not to stress — just to see where the money flowed. Don't change anything yet, just look.", upcoming: "Southeast, Xun — the wind brings news and passersby. A source of income beyond your main one — have you caught its scent?" },
    Mentor: { today: "Send a message to someone you admire but don't know well. Keep it short — just ask: \"What interesting things are you working on lately?\"", upcoming: "Southeast, where wind enters. The flag moves not because the flag is strong, but because the wind is. Who's helping you — can you see them clearly?" },
    Romance: { today: "Open that movie you marked \"watch later\" but never watched. No recaps or clips — the full two hours. No fast-forward tonight.", upcoming: "Southeast, lively places near water. A name you haven't thought about in a while, or a familiar face you keep seeing? The first one that comes to mind — you already know." },
    Wisdom: { today: "Explain what you learned today to someone else, in your own words. Where you stumble — that's where you haven't quite understood.", upcoming: "Southeast, Xun position. The wind doesn't pick a direction — but you should know which way you want to blow. What you're studying — is it what others want, or what you want to know?" }
  },
  South: {
    element: "Fire", trigram: "Li (Fire)", imagery: "Bustling, lively places",
    Wealth: { today: "Something sitting unused for over six months — list it on a second-hand platform. Fire has to leap out to burn.", upcoming: "South, Li — brightness casts shadows. Your current income stream — is it lighting you up or draining you dry?" },
    Mentor: { today: "Stand up straight. Right now — shoulders back, three deep breaths. Change your posture, change your presence.", upcoming: "South, where voices gather. Is there a gathering you've been meaning to attend? The one that answers fastest — go." },
    Romance: { today: "Change your profile picture to the one you think you look best in. Fire needs to be seen — let yourself see it first.", upcoming: "South, Li position. Light it up. That hidden self of yours — has anyone ever really seen it?" },
    Wisdom: { today: "Three minutes. Just three — open that tutorial you bookmarked but never started. Just the beginning of the first lesson.", upcoming: "South, of the Fire element. Passion is not a flaw — three minutes of fire is enough to boil a pot of water. When was the last time you caught fire?" }
  },
  Southwest: {
    element: "Earth", trigram: "Kun (Earth)", imagery: "Where virtue carries all",
    Wealth: { today: "Touch something real with your hands — wood, pottery, stone. Don't just look — touch. Money is abstract; texture is real.", upcoming: "Southwest, Kun position. Earth doesn't rush the harvest — what you planted will come in its season. What season is it now?" },
    Mentor: { today: "When you finish something today, don't replay it in your head. Done is done.", upcoming: "Southwest, Kun, of the Earth element. No one looks at a building's foundation — but the builder knows. The work you're doing — are you building up or digging down?" },
    Romance: { today: "Give someone a genuine compliment today. Not politeness — something you truly appreciate about them. Say it out loud.", upcoming: "Southwest, where virtue bears all. Comfortable relationships need no manual — you sit down and know. Is there somewhere you've been holding tension?" },
    Wisdom: { today: "If you learn something today and forget half of it tomorrow — that's fine. Earth doesn't mind slow. Earth keeps everything.", upcoming: "Southwest, Kun position. The fastest learner isn't the smartest — it's the one who isn't in a hurry. What are you rushing?" }
  },
  West: {
    element: "Metal", trigram: "Dui (Lake)", imagery: "Where fine metal gathers",
    Wealth: { today: "Organize one drawer. Just one. Throw out what's clearly useless — sharpen the scissors, clear the drawer.", upcoming: "West, Dui, of the Metal element. Metal doesn't hide. You have something valuable that you've never treated as valuable. What is it?" },
    Mentor: { today: "There's something you've needed to say. How long have you put it off? Dui is the mouth — speak it.", upcoming: "West, where sharpness gathers. What you're doing right now — are you sharpening the blade or chopping wood? Sharpening doesn't delay the work. When did you last sharpen yours?" },
    Romance: { today: "When you talk to someone today, look them in the eye. Not staring — just pause there for one second.", upcoming: "West, Dui position. Metal rings clearly — when you admire someone, they can usually tell. Who have you been hiding it from lately?" },
    Wisdom: { today: "Delete one saved tutorial or course you'll never actually go through. Less is more — removing one helps more than adding three.", upcoming: "West, of the Metal element. Refinement is not abundance — it's precision through subtraction. In what you're learning — do you have breadth or depth?" }
  },
  Northwest: {
    element: "Metal", trigram: "Qian (Heaven)", imagery: "Where sky meets open land",
    Wealth: { today: "Don't spend any unnecessary money today. Not to save — just to feel the difference between \"not buying\" and \"not lacking.\"", upcoming: "Northwest, Qian — the heavens. When the sky doesn't rain, watering won't help — some income is seasonal, and rushing won't change the season. Is it drought or monsoon right now?" },
    Mentor: { today: "Before you walk out the door, stand straight for three seconds. Shoulders open. Posture shifts luck — Qian people walk with wind at their back.", upcoming: "Northwest, Qian position, high open ground. Stay in this spot, or climb higher? That thought that jumped into your head last month when you couldn't sleep — is it still there?" },
    Romance: { today: "Eat one meal alone today. Not loneliness — just taste what the food is like when no one is talking.", upcoming: "Northwest, vast sky above. Qian people tend to respect before they love — among the people you've met recently, is there one worthy of your respect?" },
    Wisdom: { today: "Notice one thing said today by someone more experienced than you. Just one sentence — then think about why they said it that way.", upcoming: "Northwest, Qian position. You can learn anything — who you learn from is what matters. Do you have a true mentor?" }
  },
  North: {
    element: "Water", trigram: "Kan (Water)", imagery: "Near water",
    Wealth: { today: "Money is like water — today, just look at it, don't touch. Check your balance, don't do anything — just look.", upcoming: "North, Kan, near water. With money — are you growing clearer or murkier? Clarity is savings, murk is drain. Which is closer to where you are now?" },
    Mentor: { today: "At work or study today, get up and walk around every forty minutes. Water needs to flow — and so do you.", upcoming: "North, Kan position. Kan is a pit — but it's also a well. The one who digs down finds water before the one who runs sideways. Are you digging or running?" },
    Romance: { today: "Today, truly listen to one person — not preparing your reply, just listening. The deepest river has the quietest surface.", upcoming: "North, near water. Being alone isn't running away — the water surface only reflects when it's still. What do you see reflected now?" },
    Wisdom: { today: "If you can't focus, don't force it. Change your spot — water tastes different in a different cup.", upcoming: "North, Kan, of the Water element. Knowledge doesn't pour in — it seeps. Lately, have you been pouring or seeping?" }
  },
  Northeast: {
    element: "Earth", trigram: "Gen (Mountain)", imagery: "Where the mountain stands still",
    Wealth: { today: "There's one thing to stop today — an unused subscription, an auto-renewal. Cancel it.", upcoming: "Northeast, Gen — the mountain. Where nothing grows on the surface, there's ore beneath. That part of you you thought was useless — have you looked at it from another angle?" },
    Mentor: { today: "If you've been too tired lately — it's not because you're doing too little, but because there are too many directions. Cross one off today.", upcoming: "Northeast, Gen position, Mountain. Stopping isn't losing — it's catching your breath to see the direction. When did you last stop?" },
    Romance: { today: "Don't reach out to anyone today. See who reaches out to you first — the mountain doesn't chase people; people come to the mountain.", upcoming: "Northeast, where the mountain stands. Gen means stopping — some relationships need stillness to see clearly. Are you chasing, or being dragged?" },
    Wisdom: { today: "When you can't memorize, copy it out by hand. The hand is slower than the brain, but the hand never lies.", upcoming: "Northeast, Gen position. The deepest learners seem the slowest — the mountain never rushes, but the mountain has always been there. What are you rushing for?" }
  }
};
function COMPASS_DIR_DATA() { return (window._lang && window._lang() === 'en') ? COMPASS_DIR_DATA_EN : COMPASS_DIR_DATA_ZH; }

var COMPASS_DIRECTIONS_ZH = ['正东','东南','正南','西南','正西','西北','正北','东北'];
var COMPASS_DIRECTIONS_EN = ['East','Southeast','South','Southwest','West','Northwest','North','Northeast'];
var COMPASS_CAT_KEYS = ['compass_wealth','compass_career','compass_love','compass_study'];
var COMPASS_CAT_NAMES_ZH = ['求财位','贵人位','桃花位','文昌位'];
var COMPASS_CAT_NAMES_EN = ['Wealth','Mentor','Romance','Wisdom'];
var COMPASS_CAT_EMOJI = ['💰','💼','💕','📚'];
function COMPASS_DIRECTIONS() { return (window._lang && window._lang() === 'en') ? COMPASS_DIRECTIONS_EN : COMPASS_DIRECTIONS_ZH; }
function COMPASS_CAT_NAMES() { return (window._lang && window._lang() === 'en') ? COMPASS_CAT_NAMES_EN : COMPASS_CAT_NAMES_ZH; }


const FORTUNE_SLIPS_ZH = [
  {lv:'上上签', poem:'云开见月明，花开自有时。\n天心已在汝，何必问归期。', dos:'宜：出门晒太阳、吃顿好的、给爸妈打电话', donts:'忌：久坐不动、喝含糖饮料、熬夜刷手机'},
  {lv:'上上签', poem:'春风得意马蹄疾，\n一日看尽长安花。', dos:'宜：大胆尝试、表白心意、吃火锅', donts:'忌：畏首畏尾、空腹喝冰美式、在家躺一天'},
  {lv:'上上签', poem:'青山遮不住，毕竟东流去。\n大江日夜流，此心无绝期。', dos:'宜：散步一万步、学道新菜、存一笔小钱', donts:'忌：半途而废、冲动购物、喝咖啡全糖'},
  {lv:'上上签', poem:'众里寻他千百度，\n蓦然回首，那人却在灯火阑珊处。', dos:'宜：整理房间、联系老朋友、抬头看天空', donts:'忌：向外求索、低头玩手机、忽略身边人'},
  {lv:'上上签', poem:'长风破浪会有时，\n直挂云帆济沧海。', dos:'宜：换发型、发朋友圈、吃螺蛳粉加炸蛋', donts:'忌：安于现状、拖延到明天、过分焦虑'},
  {lv:'上上签', poem:'山重水复疑无路，\n柳暗花明又一村。', dos:'宜：再坚持一下、换个角度、喝杯热茶', donts:'忌：绝望放弃、钻牛角尖、深夜 emo'},
  {lv:'上签', poem:'好风凭借力，送我上青云。\n良机已至，切勿迟疑。', dos:'宜：转发微博求好运、约朋友散步、早睡早起', donts:'忌：孤军奋战、谦虚过度、报复性熬夜'},
  {lv:'上签', poem:'春种一粒粟，秋收万颗子。\n此刻耕耘，必有厚报。', dos:'宜：健身打卡、学新技能、喝无糖豆浆', donts:'忌：急功近利、炫耀、空腹喝酒'},
  {lv:'上签', poem:'海内存知己，天涯若比邻。\n贵人就在你身边。', dos:'宜：请人吃饭、主动求助、户外下午茶', donts:'忌：孤僻冷漠、逞强、只喝添加剂饮料'},
  {lv:'上签', poem:'不畏浮云遮望眼，\n只缘身在最高层。', dos:'宜：读书半小时、做拉伸、吃水果', donts:'忌：纠结琐事、刷短视频到凌晨、久坐'},
  {lv:'上签', poem:'莫愁前路无知己，\n天下谁人不识君。', dos:'宜：自信表达、更新简历、拍张好看的照片', donts:'忌：自我怀疑、穿秋裤嫌丑、不吃饭减肥'},
  {lv:'上签', poem:'花开堪折直须折，\n莫待无花空折枝。', dos:'宜：说走就走、吃当季水果、表白', donts:'忌：完美主义、等"准备好了再说"'},
  {lv:'上签', poem:'千淘万漉虽辛苦，\n吹尽狂沙始到金。', dos:'宜：坚持一个好习惯、多喝水、晒太阳补钙', donts:'忌：频繁跳槽、熬夜赶工、用饮料代替水'},
  {lv:'上签', poem:'在天愿作比翼鸟，\n在地愿为连理枝。', dos:'宜：牵手散步、做一顿饭给对方吃、看日落', donts:'忌：冷战、翻旧账、分心玩手机'},
  {lv:'上签', poem:'等闲识得东风面，\n万紫千红总是春。', dos:'宜：逛公园、拍照记录生活、吃烧烤', donts:'忌：宅家不出门、消极抱怨、不吃早餐'},
  {lv:'上签', poem:'沉舟侧畔千帆过，\n病树前头万木春。', dos:'宜：断舍离旧物、换新床单、吃一顿好的', donts:'忌：沉溺回忆、比较他人、不运动'},
  {lv:'上签', poem:'会当凌绝顶，一览众山小。\n格局打开，天地自宽。', dos:'宜：爬山、制定年度计划、喝绿茶', donts:'忌：斤斤计较、小家子气、长时间看屏幕'},
  {lv:'上签', poem:'身无彩凤双飞翼，\n心有灵犀一点通。', dos:'宜：相信直觉、给朋友发条暖心的消息', donts:'忌：过度解释、怀疑别人的好意'},
  {lv:'中签', poem:'行到水穷处，坐看云起时。\n不急不躁，顺势而为。', dos:'宜：泡脚、听雨声、写日记、喝温开水', donts:'忌：强行推进、冲动辞职、焦虑到失眠'},
  {lv:'中签', poem:'水至清则无鱼，人至察则无徒。\n难得糊涂，大智若愚。', dos:'宜：吃顿垃圾食品开心一下、看喜剧、睡午觉', donts:'忌：挑剔别人、钻牛角尖、对自己太苛刻'},
  {lv:'中签', poem:'人生如逆旅，我亦是行人。\n一切都会过去，包括此刻的迷茫。', dos:'宜：出去走走换口气、听喜欢的歌、喝奶茶三分糖', donts:'忌：胡思乱想到天亮、长时间刷负面新闻'},
  {lv:'中签', poem:'塞翁失马，焉知非福。\n今日得失，来日方知。', dos:'宜：保持平常心、存一笔钱、做顿健康餐', donts:'忌：大喜大悲、冲动消费、拿铁因子太多'},
  {lv:'中签', poem:'路漫漫其修远兮，\n吾将上下而求索。', dos:'宜：坚持运动、学一个拿手菜、早睡', donts:'忌：求快、走捷径、吃太多外卖'},
  {lv:'中签', poem:'明月几时有，把酒问青天。\n答案不在外面，在你自己心里。', dos:'宜：独处片刻、做几个深呼吸、喝热牛奶', donts:'忌：到处问人意见、轻信网络、睡前刷手机'},
  {lv:'中签', poem:'十年磨一剑，霜刃未曾试。\n你准备好了，但时机还未到。', dos:'宜：继续打磨自己、规律作息、吃坚果', donts:'忌：仓促出手、在朋友圈秀半成品'},
  {lv:'中签', poem:'两情若是久长时，\n又岂在朝朝暮暮。', dos:'宜：给对方空间、专注自己的事、健身', donts:'忌：黏人、患得患失、信息轰炸'},
  {lv:'中签', poem:'一花一世界，一叶一菩提。\n平凡之中自有深意。', dos:'宜：做一顿家常菜、打理绿植、感恩小事', donts:'忌：好高骛远、总羡慕别人的生活'},
  {lv:'中签', poem:'桃李不言，下自成蹊。\n做好自己，一切自会到来。', dos:'宜：默默努力、保持微笑、多吃蔬菜', donts:'忌：急于证明自己、和别人比较'},
  {lv:'中签', poem:'山不在高，有仙则名。\n水不在深，有龙则灵。', dos:'宜：深耕一个技能、午休小憩、喝柠檬水', donts:'忌：贪多嚼不烂、跟风报班、不吃午饭'},
  {lv:'中签', poem:'人有悲欢离合，月有阴晴圆缺。\n此事古难全。', dos:'宜：接受不完美、给自己放个假、吃甜点', donts:'忌：追求完美、自怨自艾、情绪化饮食'},
  {lv:'中签', poem:'旧时王谢堂前燕，\n飞入寻常百姓家。', dos:'宜：脚踏实地、逛菜市场、亲手做顿饭', donts:'忌：眼高手低、摆架子、只点外卖'},
  {lv:'中签', poem:'问渠那得清如许，\n为有源头活水来。', dos:'宜：去没去过的地方走走、认识新朋友、喝八杯水', donts:'忌：固步自封、吃老本、只喝奶茶不喝水'},
  {lv:'中签', poem:'纸上得来终觉浅，\n绝知此事要躬行。', dos:'宜：动手试试、户外活动、做一顿失败的菜也没关系', donts:'忌：光看教程不动手、收藏等于做了'},
  {lv:'中签', poem:'梅须逊雪三分白，\n雪却输梅一段香。', dos:'宜：找到自己的赛道、穿让你自信的衣服', donts:'忌：模仿别人、羡慕嫉妒、否定自己'},
  {lv:'中签', poem:'横看成岭侧成峰，\n远近高低各不同。', dos:'宜：换个角度看问题、散步时换条路走', donts:'忌：固执己见、一条道走到黑'},
  {lv:'中签', poem:'今朝有酒今朝醉，\n明日愁来明日愁。', dos:'宜：享受当下、和朋友小酌一杯、吃烤串', donts:'忌：过度焦虑未来、酗酒、暴饮暴食'},
  {lv:'中签', poem:'劝君更尽一杯酒，\n西出阳关无故人。', dos:'宜：给老朋友打视频、吃一顿送行饭', donts:'忌：不告而别、把话憋在心里'},
  {lv:'中签', poem:'小荷才露尖尖角，\n早有蜻蜓立上头。', dos:'宜：展示小成果、接受夸奖、穿亮色衣服', donts:'忌：害羞躲藏、觉得"还不够好"'},
  {lv:'下签', poem:'抽刀断水水更流，\n举杯消愁愁更愁。', dos:'宜：出门跑步流汗、找人倾诉、喝杯热可可', donts:'忌：借酒消愁、一个人憋着、深夜胡思乱想'},
  {lv:'下签', poem:'不识庐山真面目，\n只缘身在此山中。', dos:'宜：请教旁人意见、站远一点看、散步放空', donts:'忌：埋头硬干、以为自己全对、不听劝'},
  {lv:'下签', poem:'相见时难别亦难，\n东风无力百花残。', dos:'宜：温柔告别、写一封信给自己、吃顿好的安慰自己', donts:'忌：纠缠不放、反复联系、不吃不喝'},
  {lv:'下签', poem:'夕阳无限好，只是近黄昏。\n美好的事物正在消逝。', dos:'宜：拍照留念、感恩拥有、喝杯热茶看窗外', donts:'忌：沉溺于失去、活在回忆里'},
  {lv:'下签', poem:'欲渡黄河冰塞川，\n将登太行雪满山。', dos:'宜：停下来休息、做个 Spa、拉伸放松', donts:'忌：强行突破、冒险激进、不看路低头冲'},
  {lv:'下签', poem:'此情可待成追忆，\n只是当时已惘然。', dos:'宜：把遗憾写下来然后扔掉、向前看', donts:'忌：反复回想"如果当初"、后悔自责'},
  {lv:'下签', poem:'无可奈何花落去，\n似曾相识燕归来。', dos:'宜：清理旧物、等新机会、晒太阳发呆', donts:'忌：强留不属于你的东西、不甘心'},
  {lv:'下签', poem:'孤舟蓑笠翁，独钓寒江雪。\n此刻你需要独处。', dos:'宜：泡个热水澡、看书听音乐、早睡', donts:'忌：强融圈子、假装合群、在人群中感到孤独'},
  {lv:'下签', poem:'近乡情更怯，不敢问来人。\n你在害怕面对某件事。', dos:'宜：深呼吸、先做五分钟再说、找人陪着', donts:'忌：拖延到最后一刻、假装不存在'},
  {lv:'下签', poem:'多情自古空余恨，\n好梦由来最易醒。', dos:'宜：脚踏实地、检查合同细节、喝杯温水', donts:'忌：轻信画饼、冲动投资、迷信捷径'},
  {lv:'下签', poem:'出师未捷身先死，\n长使英雄泪满襟。', dos:'宜：养精蓄锐、锻炼身体增强体质、喝鸡汤', donts:'忌：盲目冲刺、熬夜加班、透支身体'},
  {lv:'下签', poem:'世间无限丹青手，\n一片伤心画不成。', dos:'宜：找个懂你的人说说话、哭一场也没关系', donts:'忌：假装没事、强颜欢笑、什么都不吃'},
  {lv:'下签', poem:'天长地久有时尽，\n此恨绵绵无绝期。', dos:'宜：彻底断舍离、删掉联系方式、去健身发泄', donts:'忌：反复回头看、视奸前任、不甘心'},
  {lv:'下签', poem:'同是天涯沦落人，\n相逢何必曾相识。', dos:'宜：找同病相怜的人聊天、互相取暖', donts:'忌：自我封闭、觉得全世界就你最惨'},
  {lv:'下下签', poem:'风萧萧兮易水寒，\n壮士一去兮不复还。', dos:'宜：保存实力、暂避锋芒、泡脚驱寒', donts:'忌：正面硬刚、孤注一掷、穿太少着凉'},
  {lv:'下下签', poem:'剪不断，理还乱，是离愁。\n别是一般滋味在心头。', dos:'宜：找信任的人聊聊、深呼吸十次、喝姜茶暖身', donts:'忌：做重大决定、迁怒于人、吃冷饮'},
  {lv:'下下签', poem:'前不见古人，后不见来者。\n念天地之悠悠，独怆然而涕下。', dos:'宜：给自己放一天假、什么也不做、晒太阳补能量', donts:'忌：硬撑、和所有人比较、否定自己的价值'},
  {lv:'下下签', poem:'人面不知何处去，\n桃花依旧笑春风。', dos:'宜：重新出发、换一个新环境、去公园看花', donts:'忌：在原地等待一个不会回来的人'},
  {lv:'下下签', poem:'物是人非事事休，欲语泪先流。\n有些事只能交给时间。', dos:'宜：允许自己悲伤、好好吃饭睡觉、慢慢来', donts:'忌：急着振作、假装已经好了、不吃不睡'},
  {lv:'下下签', poem:'庭院深深深几许，\n杨柳堆烟，帘幕无重数。', dos:'宜：走出去晒太阳、换一个环境透气、见见阳光', donts:'忌：把自己关起来、不见人、窗帘拉死'},
  {lv:'下下签', poem:'此去经年，应是良辰好景虚设。\n便纵有千种风情，更与何人说。', dos:'宜：写日记、学独处、养一只猫或植物作伴', donts:'忌：憋在心里烂掉、拒绝所有善意'},
  {lv:'下下签', poem:'十年生死两茫茫，\n不思量，自难忘。', dos:'宜：好好告别、烧一顿ta爱吃的菜、继续前行', donts:'忌：沉溺悲伤无法自拔、忽略身边还活着的人'},
];

const FORTUNE_SLIPS_EN = [
 { lv: 'Supreme', poem: 'Clouds part — the moon appears.\nFlowers bloom in their own time.\nHeaven\'s will is already within you.\nWhy ask when you\'ll return home?', dos: 'Do: Get some sun, eat a good meal, call your parents', donts: 'Don\'t: Sit still all day, drink sugary drinks, stay up scrolling' },
 { lv: 'Supreme', poem: 'The spring breeze lifts the horse\'s hooves —\nIn one day, see all the flowers of Chang\'an.', dos: 'Do: Take a bold leap, confess your feelings, eat hotpot', donts: 'Don\'t: Hesitate, drink iced coffee on an empty stomach, lie around all day' },
 { lv: 'Supreme', poem: 'Green mountains cannot block the river —\nIt flows east regardless.\nThe great river runs day and night.\nThis heart knows no end.', dos: 'Do: Walk 10,000 steps, learn a new recipe, save a little money', donts: 'Don\'t: Quit halfway, impulse shop, drink full-sugar coffee' },
 { lv: 'Supreme', poem: 'I searched for them among thousands —\nTurning back, there they stood,\nin the fading lantern light.', dos: 'Do: Tidy your room, call an old friend, look up at the sky', donts: 'Don\'t: Seek outside yourself, stare at your phone, ignore the people nearby' },
 { lv: 'Supreme', poem: 'A long wind will break the waves —\nI\'ll raise my sail and cross the sea.', dos: 'Do: Change your hairstyle, post on social media, eat noodles with extra egg', donts: 'Don\'t: Settle for the status quo, procrastinate till tomorrow, overthink' },
 { lv: 'Supreme', poem: 'Mountains and rivers seem to end —\nThen willows bloom and a new village appears.', dos: 'Do: Hold on a little longer, shift your perspective, drink a warm cup of tea', donts: 'Don\'t: Give up in despair, overthink in circles, late-night spiral' },
 { lv: 'Excellent', poem: 'A fair wind lifts me to the clouds.\nThe moment has come — do not hesitate.', dos: 'Do: Share for good luck, take a walk with a friend, sleep early tonight', donts: 'Don\'t: Go it alone, be too modest, stay up revenge-scrolling' },
 { lv: 'Excellent', poem: 'Plant one seed in spring,\nReap ten thousand grains in fall.\nWhat you sow now will bear rich fruit.', dos: 'Do: Hit the gym, learn a new skill, drink unsweetened soy milk', donts: 'Don\'t: Chase quick results, show off, drink on an empty stomach' },
 { lv: 'Excellent', poem: 'A bosom friend across the world\nIs as close as a neighbor.\nYour benefactor is right beside you.', dos: 'Do: Treat someone to a meal, ask for help when you need it, have afternoon tea outdoors', donts: 'Don\'t: Be cold or distant, tough it out alone, drink nothing but additives' },
 { lv: 'Excellent', poem: 'Floating clouds cannot block the view —\nFor I stand at the highest peak.', dos: 'Do: Read for half an hour, stretch, eat some fruit', donts: 'Don\'t: Obsess over trifles, scroll short videos till dawn, sit too long' },
 { lv: 'Excellent', poem: 'Don\'t worry about the road ahead —\nWho under heaven doesn\'t know your name?', dos: 'Do: Speak with confidence, update your resume, take a nice photo', donts: 'Don\'t: Doubt yourself, wear long johns and hate it, skip meals to lose weight' },
 { lv: 'Excellent', poem: 'When flowers bloom, pluck them —\nDon\'t wait till the branch is bare.', dos: 'Do: Go on that spontaneous trip, eat seasonal fruit, make the first move', donts: 'Don\'t: Be a perfectionist, wait till you\'re "ready"' },
 { lv: 'Excellent', poem: 'A thousand washings, a thousand siftings —\nOnly when the sand is gone does gold appear.', dos: 'Do: Stick to a good habit, drink more water, get some sun for vitamin D', donts: 'Don\'t: Job-hop impulsively, pull all-nighters, replace water with soda' },
 { lv: 'Excellent', poem: 'In heaven, we\'d be two birds flying wing to wing.\nOn earth, two trees with branches intertwined.', dos: 'Do: Hold hands on a walk, cook a meal for them, watch the sunset together', donts: 'Don\'t: Give the silent treatment, dredge up old fights, scroll on your phone instead' },
 { lv: 'Excellent', poem: 'Now I know the face of the east wind —\nA thousand purples, ten thousand reds — it is always spring.', dos: 'Do: Visit a park, take photos of your life, have a barbecue', donts: 'Don\'t: Stay home all day, complain endlessly, skip breakfast' },
 { lv: 'Excellent', poem: 'A thousand sails pass the sunken ship —\nTen thousand trees spring forth beside the withered one.', dos: 'Do: Declutter old things, put on fresh bedsheets, eat something really good', donts: 'Don\'t: Dwell on memories, compare yourself to others, skip exercise' },
 { lv: 'Excellent', poem: 'I will climb to the highest peak —\nAnd see all the mountains shrink below.\nOpen your mind; the world opens with it.', dos: 'Do: Hike a mountain, make an annual plan, drink green tea', donts: 'Don\'t: Sweat the small stuff, be petty, stare at screens all day' },
 { lv: 'Excellent', poem: 'Though I lack the phoenix\'s colorful wings,\nOur hearts share the same unspoken thread.', dos: 'Do: Trust your intuition, send a warm message to a friend', donts: 'Don\'t: Over-explain, doubt others\' kindness' },
 { lv: 'Moderate', poem: 'Walk to where the water ends —\nSit and watch the clouds rise.\nNo rush, no force — flow with what comes.', dos: 'Do: Soak your feet, listen to the rain, journal, drink warm water', donts: 'Don\'t: Push too hard, quit your job impulsively, lose sleep to anxiety' },
 { lv: 'Moderate', poem: 'Water too clear has no fish.\nToo discerning has no friends.\nBlessed is the art of not knowing.', dos: 'Do: Eat some junk food guilt-free, watch a comedy, take a nap', donts: 'Don\'t: Nitpick others, obsess over details, be too hard on yourself' },
 { lv: 'Moderate', poem: 'Life is a traveler\'s inn —\nAnd I, too, am just passing through.\nEverything passes — including this confusion.', dos: 'Do: Step outside for fresh air, listen to your favorite song, drink milk tea at 30% sugar', donts: 'Don\'t: Overthink till dawn, binge bad news for hours' },
 { lv: 'Moderate', poem: 'The old man lost his horse —\nWho knows if it wasn\'t a blessing?\nToday\'s loss — only time will tell its meaning.', dos: 'Do: Keep an even keel, save some money, cook a healthy meal', donts: 'Don\'t: Ride emotional highs and lows, impulse spend, leak money on small daily purchases' },
 { lv: 'Moderate', poem: 'The road ahead is long and endless —\nI will search high and low.', dos: 'Do: Keep exercising, master one signature dish, sleep early', donts: 'Don\'t: Chase shortcuts, rely on too much takeout' },
 { lv: 'Moderate', poem: 'When will the bright moon appear?\nI raise my cup and ask the sky.\nThe answer isn\'t out there — it\'s inside you.', dos: 'Do: Spend a moment alone, take deep breaths, drink warm milk', donts: 'Don\'t: Ask everyone for advice, trust the internet blindly, scroll before bed' },
 { lv: 'Moderate', poem: 'Ten years sharpening a single sword —\nIts blade has never been tested.\nYou\'re ready, but the time hasn\'t come.', dos: 'Do: Keep refining yourself, maintain a routine, eat some nuts', donts: 'Don\'t: Launch prematurely, show half-finished work on social media' },
 { lv: 'Moderate', poem: 'If love between two hearts can last —\nWhy must they be together day and night?', dos: 'Do: Give them space, focus on your own things, work out', donts: 'Don\'t: Be clingy, second-guess everything, message-bomb them' },
 { lv: 'Moderate', poem: 'One flower — one world.\nOne leaf — one wisdom.\nProfound meaning hides in the ordinary.', dos: 'Do: Cook a simple meal, tend your plants, appreciate small blessings', donts: 'Don\'t: Aim too high, envy everyone else\'s life' },
 { lv: 'Moderate', poem: 'The peach and plum trees speak not —\nYet a path forms beneath them.\nBe yourself, and everything will come.', dos: 'Do: Work quietly, keep smiling, eat more vegetables', donts: 'Don\'t: Rush to prove yourself, compare yourself to others' },
 { lv: 'Moderate', poem: 'A mountain needs no height to be famous —\nIf immortals dwell there.\nWater needs no depth to be magical —\nIf dragons live within.', dos: 'Do: Deepen one skill, take a power nap, drink lemon water', donts: 'Don\'t: Spread yourself too thin, sign up for every course, skip lunch' },
 { lv: 'Moderate', poem: 'People have joy and sorrow, parting and reunion.\nThe moon waxes and wanes —\nIt has always been this way.', dos: 'Do: Accept imperfection, give yourself a break, eat dessert', donts: 'Don\'t: Chase perfection, wallow in self-pity, emotionally eat' },
 { lv: 'Moderate', poem: 'The swallows that nested in grand halls —\nNow fly into ordinary homes.', dos: 'Do: Keep your feet on the ground, browse the farmers\' market, cook from scratch', donts: 'Don\'t: Aim high but do nothing, put on airs, order takeout for every meal' },
 { lv: 'Moderate', poem: 'Ask the canal — how is your water so clear?\nBecause fresh water flows in from the source.', dos: 'Do: Go somewhere you\'ve never been, meet someone new, drink eight glasses of water', donts: 'Don\'t: Stay stuck in your ways, rest on past success, drink only milk tea' },
 { lv: 'Moderate', poem: 'What you learn from books is shallow —\nTrue knowledge comes from doing it yourself.', dos: 'Do: Try it with your hands, do something outdoors, even a failed dish is a win', donts: 'Don\'t: Just watch tutorials, treat "saved" as "done"' },
 { lv: 'Moderate', poem: 'Plum blossoms may lack the snow\'s pure white —\nBut snow lacks the plum\'s fragrance.', dos: 'Do: Find your own lane, wear what makes you confident', donts: 'Don\'t: Copy others, envy others, deny your own worth' },
 { lv: 'Moderate', poem: 'Viewed from the side — a ridge. From the front — a peak.\nNear or far, high or low — each angle is different.', dos: 'Do: See things from another angle, take a different route on your walk', donts: 'Don\'t: Be stubborn, keep going the same dead-end way' },
 { lv: 'Moderate', poem: 'Drink today\'s wine today —\nTomorrow\'s worries belong to tomorrow.', dos: 'Do: Enjoy the present moment, have a small drink with a friend, eat barbecue', donts: 'Don\'t: Over-worry about the future, drink to excess, binge eat' },
 { lv: 'Moderate', poem: 'Let me pour you one more cup —\nWest of the pass, there\'ll be no old friends.', dos: 'Do: Video-call an old friend, share a farewell meal', donts: 'Don\'t: Leave without saying goodbye, keep everything bottled up' },
 { lv: 'Moderate', poem: 'A tiny lotus bud just peeks above the water —\nAnd already a dragonfly has perched upon it.', dos: 'Do: Share a small achievement, accept compliments, wear bright colors', donts: 'Don\'t: Hide in shyness, think it\'s "not good enough yet"' },
 { lv: 'Poor', poem: 'You draw a blade to cut the water — it flows faster.\nYou raise a cup to drown sorrow — it only deepens.', dos: 'Do: Go for a run and sweat it out, talk to someone you trust, drink hot cocoa', donts: 'Don\'t: Drown your sorrows, bottle it up, spiral alone late at night' },
 { lv: 'Poor', poem: 'You cannot see the true shape of the mountain —\nBecause you are standing on it.', dos: 'Do: Ask someone for their perspective, step back and look again, take a walk to clear your head', donts: 'Don\'t: Keep pushing blindly, assume you\'re always right, ignore advice' },
 { lv: 'Poor', poem: 'Hard to meet — and hard to part.\nThe east wind is weak, a hundred flowers wither.', dos: 'Do: Say a gentle goodbye, write a letter to yourself, comfort yourself with good food', donts: 'Don\'t: Cling and refuse to let go, keep reaching out, stop eating' },
 { lv: 'Poor', poem: 'The sunset is infinitely beautiful —\nOnly, dusk is near.\nSomething beautiful is fading.', dos: 'Do: Take a photo to remember, be grateful for what you have, sip tea and gaze out the window', donts: 'Don\'t: Drown in loss, live in the past' },
 { lv: 'Poor', poem: 'I try to cross the Yellow River — ice blocks my way.\nI try to climb the Taihang Mountains — snow fills the pass.', dos: 'Do: Stop and rest, get a massage, stretch and relax', donts: 'Don\'t: Force a breakthrough, take reckless risks, charge ahead with your head down' },
 { lv: 'Poor', poem: 'These feelings — now they\'re only memories.\nAt the time, I was too lost to understand.', dos: 'Do: Write down your regret, then throw it away. Look forward.', donts: 'Don\'t: Replay "what if" on a loop, drown in regret and self-blame' },
 { lv: 'Poor', poem: 'Nothing can stop the flowers falling —\nBut look — the swallows that return feel familiar.', dos: 'Do: Clear out old things, wait for new opportunities, bask in the sun and daydream', donts: 'Don\'t: Cling to what isn\'t yours, refuse to accept it\'s over' },
 { lv: 'Poor', poem: 'A lone boat, a straw cloak, an old man —\nFishing alone in the cold river snow.\nRight now, you need solitude.', dos: 'Do: Take a hot bath, read a book and listen to music, sleep early', donts: 'Don\'t: Force yourself into social circles, pretend to fit in, feel lonely in a crowd' },
 { lv: 'Poor', poem: 'Approaching home — my heart grows timid.\nI dare not ask the ones who come.\nYou\'re afraid to face something.', dos: 'Do: Take a deep breath, just do the first five minutes, bring someone with you', donts: 'Don\'t: Procrastinate to the last second, pretend it doesn\'t exist' },
 { lv: 'Poor', poem: 'Too much love — only endless regret.\nThe sweetest dreams are always the first to wake.', dos: 'Do: Keep your feet on the ground, check the fine print, drink warm water', donts: 'Don\'t: Believe empty promises, invest impulsively, fall for shortcuts' },
 { lv: 'Poor', poem: 'The army marched out, but the general fell first —\nHeroes shed tears through the ages.', dos: 'Do: Conserve your strength, build your body through exercise, drink nourishing soup', donts: 'Don\'t: Sprint blindly into battle, pull all-nighters, burn out your body' },
 { lv: 'Poor', poem: 'In all the world, countless master painters —\nYet none can paint a broken heart.', dos: 'Do: Find someone who understands you and talk, crying is okay too', donts: 'Don\'t: Pretend you\'re fine, force a smile, eat nothing at all' },
 { lv: 'Poor', poem: 'Heaven and earth will one day end —\nBut this ache goes on and on.', dos: 'Do: Cut ties completely, delete their contact, go to the gym and sweat it out', donts: 'Don\'t: Keep looking back, stalk your ex, refuse to let go' },
 { lv: 'Poor', poem: 'We are both wanderers at the edge of the world —\nWhy need we have met before to understand?', dos: 'Do: Find someone who\'s been through the same, keep each other warm', donts: 'Don\'t: Isolate yourself, think you\'re the only one suffering' },
 { lv: 'Dire', poem: 'The wind howls — the Yi River is cold.\nThe hero rides out — and will not return.', dos: 'Do: Save your strength, avoid the front line, soak your feet to ward off cold', donts: 'Don\'t: Charge in headfirst, gamble everything, wear too little and catch a chill' },
 { lv: 'Dire', poem: 'Cut — it won\'t sever.\nUntangle — it only knots more.\nThis is the taste of parting sorrow.\nAn unnamable ache in the heart.', dos: 'Do: Talk to someone you trust, take ten deep breaths, drink ginger tea to warm up', donts: 'Don\'t: Make big decisions, take anger out on others, drink cold beverages' },
 { lv: 'Dire', poem: 'No ancients before me —\nNo successors behind.\nThinking of the vastness of heaven and earth,\nAlone, my tears fall.', dos: 'Do: Give yourself a day off, do nothing at all, sunbathe to recharge', donts: 'Don\'t: Tough it out, compare yourself to everyone, deny your own worth' },
 { lv: 'Dire', poem: 'I don\'t know where they\'ve gone —\nBut the peach blossoms still smile in the spring breeze.', dos: 'Do: Start fresh, change your environment, go to a park and see the flowers', donts: 'Don\'t: Wait in the same place for someone who won\'t return' },
 { lv: 'Dire', poem: 'Everything has changed — nothing remains.\nI try to speak but tears come first.\nSome things only time can heal.', dos: 'Do: Allow yourself to grieve, eat well and sleep well, take it slowly', donts: 'Don\'t: Rush to be "fine" again, pretend you\'ve already healed, stop eating and sleeping' },
 { lv: 'Dire', poem: 'Deep, deep the courtyard — how deep?\nWillows piled on willows, curtains upon curtains —\nNo end in sight.', dos: 'Do: Go outside into the sun, change your environment for fresh air, see the daylight', donts: 'Don\'t: Lock yourself away, avoid people, keep the curtains drawn tight' },
 { lv: 'Dire', poem: 'After all these years —\nEven the most beautiful scenes feel empty.\nA thousand feelings — and no one to tell.', dos: 'Do: Keep a journal, learn to be alone, get a cat or a plant for company', donts: 'Don\'t: Let it rot inside you, reject every kindness offered' },
 { lv: 'Dire', poem: 'Ten years — life and death — vast and boundless.\nI do not think of them — yet I cannot forget.', dos: 'Do: Say a proper goodbye, cook their favorite dish, keep walking forward', donts: 'Don\'t: Drown in grief forever, ignore the living who are still here' }
];
function FORTUNE_SLIPS() { return (window._lang && window._lang() === 'en') ? FORTUNE_SLIPS_EN : FORTUNE_SLIPS_ZH; }

const RP_TIERS_ZH = [
  {min:95,  label:'气运之子',  emoji:'👑', tip:'去买彩票不如去表白——今天的你是被宇宙亲吻过的人。'},
  {min:85,  label:'吉星高照',  emoji:'🌟', tip:'今天的幸运女神在你这边，做什么都顺。大方地接受赞美和好运吧。'},
  {min:70,  label:'顺风顺水',  emoji:'🌈', tip:'不错的一天，小事顺利，大事可期。保持微笑，好运会被你吸引过来。'},
  {min:50,  label:'平平淡淡',  emoji:'🌤️', tip:'没有惊喜也没有惊吓，平凡也是一种幸福。今天的主题是"稳"。'},
  {min:30,  label:'小有波折',  emoji:'🌧️', tip:'可能有点小不顺，但不足以影响你的好心情。水逆吗？不，只是你太着急了。'},
  {min:15,  label:'诸事不宜',  emoji:'⛈️', tip:'今天适合低调——能不出门就不出门，能不说话就不说话。忍一天，明天再来。'},
  {min:0,   label:'触底反弹',  emoji:'🌪️', tip:'人品已跌至谷底——别担心，这说明明天只会更好。今天适合：吃饭、睡觉、看剧，不干正事。'},
];
const RP_TIERS_EN = [
  {min:95,  label:'Fortune\'s Child',  emoji:'👑', tip:'Forget the lottery — go confess your feelings. Today the universe has kissed your forehead.'},
  {min:85,  label:'Star-Blessed',  emoji:'🌟', tip:'Lady Luck is on your side today. Everything flows. Accept compliments and good fortune with grace.'},
  {min:70,  label:'Smooth Sailing',  emoji:'🌈', tip:'A lovely day — small things go well, big things look promising. Keep smiling and luck will find you.'},
  {min:50,  label:'Steady as She Goes',  emoji:'🌤️', tip:'No surprises, good or bad. Ordinary is its own kind of happiness. Today\'s theme: steady.'},
  {min:30,  label:'Minor Turbulence',  emoji:'🌧️', tip:'A few bumps, but nothing that should ruin your mood. Mercury retrograde? No, you\'re just rushing.'},
  {min:15,  label:'Everything Against You',  emoji:'⛈️', tip:'Today is for laying low — stay home if you can, stay quiet if you can\'t. Endure one day, come back tomorrow.'},
  {min:0,   label:'Bounce Back',  emoji:'🌪️', tip:'Rock bottom — don\'t worry, it only means tomorrow will be better. Today\'s agenda: eat, sleep, watch shows. Nothing productive.'},
];
function RP_TIERS() { return (window._lang && window._lang() === 'en') ? RP_TIERS_EN : RP_TIERS_ZH; }

const LUCKY_COLORS_ZH = ['琥珀金','深空蓝','玫瑰粉','翡翠绿','紫罗兰','珊瑚橙','月光银','墨玉黑','珊瑚红','天青','杏黄','靛蓝'];
const LUCKY_COLORS_EN = ['Amber Gold','Deep Space Blue','Rose Pink','Jade Green','Violet','Coral Orange','Moonlight Silver','Onyx Black','Coral Red','Sky Cyan','Apricot Yellow','Indigo'];
const LUCKY_DIRS_ZH  = ['东南方','正北','西南','正东','西北','正南','东北','正西'];
const LUCKY_DIRS_EN  = ['Southeast','North','Southwest','East','Northwest','South','Northeast','West'];
function LUCKY_COLORS() { return (window._lang && window._lang() === 'en') ? LUCKY_COLORS_EN : LUCKY_COLORS_ZH; }
function LUCKY_DIRS() { return (window._lang && window._lang() === 'en') ? LUCKY_DIRS_EN : LUCKY_DIRS_ZH; }

const BOOK_ANSWERS_ZH = [
  '是的，毫无疑问。','现在还不是时候。','跟随你的直觉。','答案就在你心中。','勇敢迈出第一步吧。','保持耐心，好事将至。','这是正确的方向。','换一个角度去看。','放下你的顾虑吧。','不要急于求成。','它会以你意想不到的方式到来。','先照顾好自己，答案自会出现。','你要的答案，其实你一直都知道。','相信过程，而非结果。','值得等待。','行动比答案更重要。','先放一放，过几天再问。','时机未到。','宇宙正在为你铺路，别急。','当你不问的时候，答案会自己来找你。','你早已知道该怎么做。','这个问题本身，比答案更有意义。','再坚持一下，就快到了。','可以，但要注意方式。','向左走，而不是向右。','别问了，去做吧。','你会在梦里找到线索。','找一个安静的地方待一会，你会听见。','先吃顿好的，然后再想。','去大自然里走走，答案在那里。','答案也许是一个你没有预料到的人。','它比你想象的要简单。','此刻的不确定，正是答案的一部分。','相信那个让你心跳加快的选择。','别问别人，问你自己。','你值得更好的。','来日方长，不急。','把手机关掉，你就知道了。','先睡一觉，明天再说。',
];
const BOOK_ANSWERS_EN = [
  'Yes, without a doubt.','Not the right time yet.','Follow your intuition.','The answer lies within you.','Take the first bold step.','Be patient — good things are coming.','It is the right direction.','Look at it from another angle.','Let go of your worries.','Don\'t rush it.','It will come in a way you least expect.','Take care of yourself first — the answer will follow.','You already know the answer you seek.','Trust the process, not the outcome.','Worth the wait.','Action matters more than answers.','Put it aside for a few days, then ask again.','The time is not yet ripe.','The universe is paving the way — be patient.','When you stop asking, the answer will find you.','You already know what to do.','The question itself is more meaningful than the answer.','Hold on a little longer — you\'re almost there.','Yes, but mind your approach.','Go left, not right.','Stop asking and just do it.','You\'ll find a clue in your dreams.','Find a quiet place and listen — you\'ll hear it.','Have a good meal first, then think.','Take a walk in nature — the answer is there.','The answer may be someone you didn\'t expect.','It\'s simpler than you think.','The uncertainty right now is part of the answer.','Trust the choice that makes your heart beat faster.','Don\'t ask others — ask yourself.','You deserve better.','There\'s plenty of time — no rush.','Turn off your phone and you\'ll know.','Sleep on it — ask again tomorrow.',
];
function BOOK_ANSWERS() { return (window._lang && window._lang() === 'en') ? BOOK_ANSWERS_EN : BOOK_ANSWERS_ZH; }

const BALL_ANSWERS_ZH = [
  '毫无疑问','是的','看起来不错','很可能是','迹象表明：是','星象显示：YES',
  '再问一次','现在说不准','稍后再问','天机不可泄露','换个问法吧',
  '别指望了','我的回答：否','可能性不大','非常可疑','星象显示：NO',
];
const BALL_ANSWERS_EN = [
  'Without a doubt','Yes','Looks good','Most likely','Signs point to: Yes','The stars say: YES',
  'Ask again','Unclear right now','Try again later','The stars keep their secrets','Try a different question',
  'Don\'t count on it','My answer is: No','Not likely','Highly doubtful','The stars say: NO',
];
function BALL_ANSWERS() { return (window._lang && window._lang() === 'en') ? BALL_ANSWERS_EN : BALL_ANSWERS_ZH; }

const ZODIAC_SIGNS_ZH = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const ZODIAC_SIGNS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
function ZODIAC_SIGNS() { return (window._lang && window._lang() === 'en') ? ZODIAC_SIGNS_EN : ZODIAC_SIGNS_ZH; }

// ── 寺庙求签 · 观音灵签（示例3签）───────────────────────────
const TEMPLE_SLIPS_GUANYIN_ZH = [
  {id:16,level:'上上签',title:'禄马照前程',poem:'破改重成望，前途喜亦宁。\n贵人相助处，禄马照前程。',vernacular:'放下旧愿、转向新目标反而更好。前方光明照耀，如骏马承载天赐宝物而来，居上位者的帮助将让你越来越有力量。',interpretation:{career:'贵人提携，前程光明。跳槽创业皆宜，把握眼前机会。',love:'良缘将至，已有伴侣者情感升温。放下过去，迎接新人。',wealth:'财源广进，正财偏财皆有收获。适合理财规划。',health:'身体康健，小恙易愈。多晒太阳，保持运动。',study:'思路清晰，考试顺利。换一个学习方法会有突破。',family:'家居安宁，适合搬家或装修。家庭关系和睦。',overall:'吉星高照，万事可期。但需放下旧执念，方能迎接新机。'},dos:'宜：大胆尝试、表白心意、吃火锅',donts:'忌：畏首畏尾、空腹喝冰美式、在家躺一天',luckyColor:'琥珀金',luckyNum:'3 / 8',luckyDir:'东南'},
  {id:1,level:'上上签',title:'云开见月明',poem:'云开见月明，花开自有时。\n天心已在汝，何必问归期。',vernacular:'烦恼如云散去，明月自然显现。花有花期，事有时节——天地自有安排，你不必急着追问结果，静候花开便是。',interpretation:{career:'时机已熟，之前的阻碍即将消散。保持信心，不要轻易放弃。',love:'良缘已近，心思放宽，不必焦虑何时相遇。已有伴侣者感情更加明朗。',wealth:'财运渐升，之前的投入开始见到回报。不宜投机取巧。',health:'身体逐渐恢复，保持规律作息。多到户外呼吸新鲜空气。',study:'方向正确，继续按部就班即可。考试运势佳，正常发挥。',family:'家庭气氛缓和，之前的小摩擦将化解。适合与家人坦诚沟通。',overall:'拨云见日，万事向明朗处发展。不必追问结果，天时自有安排。'},dos:'宜：出门晒太阳、吃顿好的、给爸妈打电话',donts:'忌：久坐不动、喝含糖饮料、熬夜刷手机',luckyColor:'月白色',luckyNum:'1 / 6',luckyDir:'正南'},
  {id:55,level:'中签',title:'云开待月明',poem:'行到水穷处，坐看云起时。\n不急不躁，顺势而为。',vernacular:'走到山穷水尽的地方也不必慌张，坐下来看云起云落即可。此刻你需要的不是拼命向前，而是停下来、静下来，等待时机自然显现。',interpretation:{career:'不急不躁，沉淀积累。跳槽不宜，守成为上。',love:'顺其自然，无需强求。给彼此一些空间反而更好。',wealth:'收支平衡，不宜大额消费。节省即赚钱。',health:'注意劳逸结合，小毛病别拖。多喝水少熬夜。',study:'按部就班，不要求快。基础扎实才是关键。',family:'一切照常，无需大动。注意家中水电小问题。',overall:'平淡即是福，难得糊涂。此刻的等待是为了更好的出发。'},dos:'宜：泡脚早睡、写日记、喝温开水',donts:'忌：强行推进、冲动辞职、焦虑到失眠',luckyColor:'秋叶棕',luckyNum:'5 / 9',luckyDir:'正西'},
];
const TEMPLE_SLIPS_GUANYIN_EN = [
  {id:16,level:'Supreme',title:'Fortune Horse Lights the Way',poem:'Break old plans, reforge new hopes.\nThe road ahead brings peace and joy.\nA noble benefactor comes to aid.\nFortune\'s horse lights the path ahead.',vernacular:'Let go of old wishes — a new direction will bring better results. The road ahead is bright and illuminated, like a divine steed carrying heavenly treasures. Help from those in high places will give you increasing strength.',interpretation:{career:'A benefactor lifts your career. Job changes and startups are favored. Seize current opportunities.',love:'A good match approaches. Existing relationships grow warmer. Let go of the past to welcome the new.',wealth:'Both regular and unexpected income flow in. Favorable time for financial planning.',health:'Good physical condition. Minor ailments resolve quickly. Sunlight and exercise are your allies.',study:'Clear thinking and smooth exams ahead. A new study method will bring a breakthrough.',family:'Peaceful home environment. Suitable for moving or renovating. Family relations are harmonious.',overall:'Fortune shines upon you — all things are possible. But release old attachments to welcome new opportunities.'},dos:'Do: Be bold, confess your feelings, enjoy hotpot',donts:'Don\'t: Hesitate, drink iced americanos on an empty stomach, lie in bed all day',luckyColor:'Amber Gold',luckyNum:'3 / 8',luckyDir:'Southeast'},
  {id:1,level:'Supreme',title:'Clouds Part, Moon Appears',poem:'Clouds part to show the bright moon,\nFlowers bloom in their own season.\nHeaven\'s heart is already within you —\nWhy ask when you will return?',vernacular:'As clouds disperse, the bright moon naturally appears. Flowers bloom in their own time — there is already a heavenly plan. You need not anxiously pursue answers; just wait quietly for the flowers to bloom.',interpretation:{career:'The time is ripe — previous obstacles are about to clear. Stay confident, don\'t give up easily.',love:'A good match is near. Relax your mind, don\'t worry about timing. Existing relationships grow clearer.',wealth:'Finances gradually improve. Previous investments begin to pay off. Avoid speculation.',health:'Your body recovers slowly. Keep a regular routine. Spend more time outdoors in fresh air.',study:'You\'re on the right track — keep going step by step. Exam luck is good, just perform normally.',family:'The home atmosphere eases. Previous small frictions will resolve. Good time for honest family talks.',overall:'Clouds part, sun shines — everything moves toward brightness. Don\'t press for answers; heaven has its timing.'},dos:'Do: Get some sun, enjoy a nice meal, call your parents',donts:'Don\'t: Sit still too long, drink sugary beverages, stay up late scrolling',luckyColor:'Moonlight White',luckyNum:'1 / 6',luckyDir:'South'},
  {id:55,level:'Moderate',title:'Sit and Watch the Clouds',poem:'Walk to where the waters end,\nSit and watch the clouds rise.\nNo rush, no fuss —\nFlow with the current.',vernacular:'Even if you reach a dead end, there is no need to panic. Just sit and watch the clouds drift. What you need now is not to push forward desperately, but to pause, be still, and wait for the right moment to emerge naturally.',interpretation:{career:'No rush — accumulate and refine quietly. Not the right time for job changes.',love:'Let things take their course. Give each other some space — it will be better.',wealth:'Income and expenses balance. Avoid large purchases. Saving is earning right now.',health:'Watch the balance between work and rest. Don\'t ignore minor issues. Drink water, sleep well.',study:'Step by step, don\'t rush. A solid foundation matters most now.',family:'Everything is as usual — no big moves needed. Check small household issues.',overall:'Ordinary peace is a blessing. This pause is preparation for a better departure.'},dos:'Do: Soak your feet, sleep early, journal, drink warm water',donts:'Don\'t: Force progress, impulsively quit your job, stay up worrying',luckyColor:'Autumn Brown',luckyNum:'5 / 9',luckyDir:'West'},
];

// ── 寺庙求签 · 关帝灵签（示例3签）───────────────────────────
const TEMPLE_SLIPS_GUANDI_ZH = [
  {id:1,level:'上上签',title:'汉高祖入关',poem:'巍巍独步向云间，\n玉殿千官第一班。\n富贵荣华天付汝，\n福如东海寿如山。',vernacular:'你如汉高祖刘邦入关一般，独步青云直上，位列群臣之首。荣华富贵是上天注定给你的，福气如东海般深、寿命如高山般稳。这是最上等的签——你所图之事，尽可放手去为。',interpretation:{career:'大吉之兆，步步高升。事业正处上升期，勇敢争取更高的位置。',love:'天作之合，良缘注定。已有伴侣者感情坚定，单身者将遇正缘。',wealth:'财源滚滚，富贵天成。投资创业皆大利，但需以诚信为本。',health:'身体康健，寿元绵长。保持良好作息即可，无需过分担忧。',study:'名列前茅，金榜题名。考试运势极佳，正常发挥即可高中。',family:'家运昌隆，长幼平安。适合添丁进口或购置房产。',overall:'孤峰独立，天下第一。你正站在最好的时机上，万事皆可成就。'},dos:'宜：大胆进取、签订合约、投资理财、结婚求婚',donts:'忌：犹豫不决、妄自菲薄、浪费天赐良机',luckyColor:'帝王黄',luckyNum:'1 / 9',luckyDir:'正北'},
  {id:51,level:'上吉',title:'苏武牧羊',poem:'守得云开见月明，\n耐心等待自然成。\n莫嫌眼下风光少，\n他日荣归福满庭。',vernacular:'像苏武在北海牧羊十九年，最终等到了回归的那一天。眼前的困顿只是暂时的，守住本心、耐心等待，乌云终将散去，明月自然出现。不要嫌弃当下的寂寞与清贫，他日荣归故里时，福气会充满你的家。',interpretation:{career:'坚守当前岗位，不要轻易跳槽。忍耐之后必有升迁。',love:'感情需要耐心经营，不要因一时的平淡而放弃。等待会换来更好的结果。',wealth:'暂时不宜冒险投资。稳守现有资产，日后自然增值。',health:'慢性问题需要耐心调养。坚持治疗可见好转。',study:'厚积薄发，坚持就是胜利。不宜频繁更换方向。',family:'家宅暂时平淡，但安稳即是福。不宜大动干戈。',overall:'守得云开见月明。此刻的忍耐和坚守，终将换来丰厚的回报。'},dos:'宜：坚守岗位、长期投资、养身调息、读书充电',donts:'忌：半途而废、频繁变动、对现状不满而冲动',luckyColor:'翡翠绿',luckyNum:'5 / 14',luckyDir:'西北'},
  {id:100,level:'下下签',title:'退守签',poem:'英雄末路气将衰，\n纵有奇才也枉为。\n时运不逢须退步，\n暂收锋芒待时机。',vernacular:'如项羽兵败乌江，纵有一身本事也难以回天。这不是你能力的问题，而是时运暂时不在你这边。此签劝你：退一步海阔天空，不要硬拼、不要赌上一切。保存实力，等待时机转好。',interpretation:{career:'暂时不宜冒进，保守行事。切勿孤注一掷或正面硬刚。',love:'感情可能面临重大考验，不合适的关系该放手时须放手。',wealth:'财运低迷，谨防破财。不要借钱、担保或大额投资。',health:'这段时间多留意身体信号，别硬撑。累了就休息，身体优先。',study:'考试或学业可能不尽如人意。暂时休整，调整方向再来。',family:'家宅不安，可能有重大变故。凡事多留余地，不要激化矛盾。',overall:'英雄也有末路时。此签不是否定你的能力，而是劝你在错误的时间不要做错误的事。退一步，保存实力，以待来日。'},dos:'宜：保守行事、保存实力、暂避锋芒、修身养性',donts:'忌：正面硬刚、孤注一掷、赌上一切、激化矛盾',luckyColor:'深墨绿',luckyNum:'1 / 6',luckyDir:'东北'},
];
const TEMPLE_SLIPS_GUANDI_EN = [
  {id:1,level:'Supreme',title:'Gaozu Enters the Pass',poem:'Towering alone, you walk among the clouds,\nFirst among the thousand officials in the jade hall.\nWealth, honor, and glory — heaven bestows them upon you.\nFortune deep as the Eastern Sea, life steady as the mountain.',vernacular:'Like Han Gaozu entering the pass, you rise alone into the clouds, ranking first among officials. Prosperity and honor are destined for you by heaven. Your fortune is as deep as the Eastern Sea, your longevity as solid as the great mountains. This is the most supreme lot — whatever you pursue, act boldly.',interpretation:{career:'A great auspicious omen — rise step by step. Your career is on the ascent. Boldly strive for higher positions.',love:'A match made in heaven. Existing bonds are firm. Singles will meet the right person.',wealth:'Wealth flows abundantly — heaven bestows prosperity. Investment and entrepreneurship are greatly favored, but integrity is essential.',health:'Robust health and longevity. Maintain good routines — no need for excessive worry.',study:'Top of the ranks. Exam luck is excellent — just perform normally and you will succeed.',family:'The household prospers — elders and children are safe. Suitable for expanding your family or purchasing property.',overall:'A lone peak, foremost under heaven. You stand at the best moment — all things can be achieved.'},dos:'Do: Advance boldly, sign contracts, invest, propose',donts:'Don\'t: Hesitate, underestimate yourself, waste this heaven-sent opportunity',luckyColor:'Imperial Gold',luckyNum:'1 / 9',luckyDir:'North'},
  {id:51,level:'Excellent',title:'Su Wu Tends Sheep',poem:'Hold fast till clouds part and the moon shines bright,\nWith patience everything falls into place.\nDon\'t begrudge the barren present scene —\nOne day you\'ll return in glory, blessings filling your home.',vernacular:'Like Su Wu herding sheep at Lake Baikal for nineteen years, you too will eventually wait out the hardship and see the day of return. The current hardship is only temporary. Hold to your heart and wait patiently — dark clouds will eventually disperse and the bright moon will appear. Do not resent the loneliness and poverty of the present; when you return home in glory, blessings will fill your household.',interpretation:{career:'Hold your current position — don\'t jump ship lightly. After patience comes promotion.',love:'Relationships need patient nurturing. Don\'t give up because of a temporary lull. Waiting brings better results.',wealth:'Not the time for risky investments. Hold existing assets — they will appreciate in time.',health:'Chronic issues need patient care. Persist with treatment and you\'ll see improvement.',study:'Slow accumulation leads to breakthroughs. Persistence is victory. Don\'t switch directions too often.',family:'The home is quiet for now, but peace itself is a blessing. No need for big moves.',overall:'Hold fast till clouds part and the moon shines. Your patience and persistence now will eventually be richly rewarded.'},dos:'Do: Hold your position, invest long-term, rest and recuperate, read and study',donts:'Don\'t: Give up halfway, make frequent changes, act rashly out of dissatisfaction',luckyColor:'Jade Green',luckyNum:'5 / 14',luckyDir:'Northwest'},
  {id:100,level:'Dire',title:'Strategic Retreat',poem:'The hero\'s road ends — his strength wanes,\nEven rare talent becomes futile.\nWhen fortune frowns, you must retreat —\nSheathe your blade and wait for better days.',vernacular:'Like Xiang Yu defeated at Wujiang, even with all your skills you cannot turn the tide. This is not a question of your ability — it is simply that the times are not with you right now. This lot advises you: take a step back and the sea and sky grow vast. Do not fight recklessly, do not bet everything on one throw. Conserve your strength and wait for better times.',interpretation:{career:'Not the time to advance rashly. Act conservatively. Do not put everything on one bet or fight head-on.',love:'Relationships may face major trials. If a relationship is not right, have the courage to let go.',wealth:'Financial downturn — guard against losses. Don\'t lend money, guarantee loans, or make big investments.',health:'Listen to your body during this time — don\'t push through. Rest when tired. Your health comes first.',study:'Exams or studies may not go as hoped. Take a break, adjust direction, then try again.',family:'The household is unsettled — major changes may come. Leave room for maneuver — don\'t escalate conflicts.',overall:'Even heroes reach their limits. This lot does not deny your ability — it advises you not to do the wrong thing at the wrong time. Step back, conserve your strength, and wait for another day.'},dos:'Do: Act conservatively, conserve strength, retreat temporarily, cultivate yourself',donts:'Don\'t: Fight head-on, bet everything, risk it all, escalate conflicts',luckyColor:'Deep Forest Green',luckyNum:'1 / 6',luckyDir:'Northeast'},
];

// ── 寺庙求签 · 吕祖灵签（示例3签）───────────────────────────
const TEMPLE_SLIPS_LVZU_ZH = [
  {id:1,level:'上上签',title:'蓬莱清浅',poem:'蓬莱宫阙对南山，\n玉露金茎霄汉间。\n自有天书传紫极，\n何须尘世问金丹。',vernacular:'蓬莱仙宫正对着南山，玉石承露、金茎接天——你所追求的答案不在尘世的丹炉里，而在你自己的心性与修行之中。天书已在紫极宫中写好，何须再去凡间苦苦寻觅？此签告谕：向内求，莫向外寻。',interpretation:{career:'你所求的事业方向是对的，但不要在外部的评价中寻找答案。坚持自己的道路。',love:'缘分天定，不必焦虑。向内观照自己的内心，反而能看清感情的真谛。',wealth:'财运不求自来。不要把心思全放在赚钱上，提升自己才是根本。',health:'身心一体，养心即是养生。减少杂念，身体自然好转。',study:'学问之道贵在自得。不要只向外求知识，内化才是关键。',family:'家宅安宁源于内心平和。你先安顿好自己的心，家自然和。',overall:'答案不在外面，在你心里。放下向外寻觅的执念，回归本心。'},dos:'宜：冥想静坐、读书内省、简化生活、感恩已有',donts:'忌：向外攀缘、贪多求快、迷信捷径、患得患失',luckyColor:'青莲紫',luckyNum:'7 / 12',luckyDir:'东方'},
  {id:50,level:'上签',title:'水月镜花',poem:'镜里看花知是假，\n水中捞月总成空。\n若能识得真消息，\n不在寻常色相中。',vernacular:'镜子里的花是假的，水中捞月终究是空。你苦苦追求的东西，也许并不是你真正需要的。真正的答案和智慧，不在表面的色相之中——放下执着，换个视角，你会看到事物的本来面目。',interpretation:{career:'不要被表面的高薪或光环迷惑，看清公司和岗位的本质再做决定。',love:'不要被外表或甜言蜜语所惑，看清对方的真心。不合适的人及早放手。',wealth:'谨防虚假的投资项目和快速致富的骗局。务实理财才是正道。',health:'不要迷信偏方或保健品，回归基本的作息和饮食才是根本。',study:'不要追求表面的分数或证书，真正的学问在于理解而非记忆。',family:'不要在家人面前强装完美。真诚面对彼此，关系才能真正的亲近。',overall:'色即是空，空即是色。放下对表面事物的执着，你会看到更真实的世界。'},dos:'宜：看清本质、务实前行、去伪存真、回归基本',donts:'忌：被表象迷惑、追逐虚名、迷信捷径、自欺欺人',luckyColor:'素心白',luckyNum:'4 / 8',luckyDir:'正南'},
  {id:99,level:'下签',title:'邯郸一梦',poem:'黄粱未熟梦先醒，\n半世功名纸上兵。\n何不回头寻旧路，\n白云深处有人耕。',vernacular:'卢生的黄粱美梦还没煮熟就醒了——半辈子的功名利禄，不过是纸上谈兵。与其执着于并不属于你的那条路，不如回头找找最初的方向。白云深处有人在默默耕耘，那才是真正属于你的归处。',interpretation:{career:'当前的方向可能并不适合你。考虑回归你最初擅长或热爱的领域。',love:'你追逐的可能并不是真正适合你的人。回头看看，也许有人在默默等你。',wealth:'财运平平，不宜追求高风险高回报。回到稳健的轨道上来。',health:'身体的疲惫源于追逐了错误的目标。放慢脚步，给身心一个回归的机会。',study:'不要为了功利目的而学习。回头看看你真正感兴趣的领域，学习效果会更好。',family:'家是最后的归处。如果在外累了，回头看看——家人一直在等你。',overall:'梦醒时分，是回归自我的开始。此签不是消极的放弃，而是让你回到真正属于你的路上。'},dos:'宜：回归初心、放慢脚步、与家人团聚、整理过往',donts:'忌：继续错误的坚持、执迷不悟、不肯回头、虚荣攀比',luckyColor:'藕荷色',luckyNum:'3 / 7',luckyDir:'西南'},
];
const TEMPLE_SLIPS_LVZU_EN = [
  {id:1,level:'Supreme',title:'Penglai Shallows',poem:'Penglai\'s jade palace faces the southern mountain,\nDew of jade on stems of gold pierce the heavens.\nThe heavenly writ already comes from the Purple Pole —\nWhy seek the golden elixir in the dusty world?',vernacular:'Penglai\'s immortal palace faces the southern mountain. Jade dew on golden stems reaches to the heavens — the answer you seek is not in the crucible of the dusty world, but in your own heart-nature and self-cultivation. The heavenly writ is already written in the Purple Pole Palace. Why continue your bitter search in the mortal realm? This lot counsels: look inward, not outward.',interpretation:{career:'Your career direction is correct, but don\'t seek answers in external validation. Stay true to your own path.',love:'Fate determines relationships — don\'t be anxious. Look inward at your own heart, and you\'ll see the true meaning of love more clearly.',wealth:'Wealth comes unbidden. Don\'t fixate entirely on earning — self-improvement is the root of everything.',health:'Body and mind are one. Nurture the heart, and you nurture the body. Reduce mental clutter — your health will naturally improve.',study:'The way of learning lies in self-discovery. Don\'t only seek external knowledge — internalization is key.',family:'Peace in the home begins with peace within. Settle your own heart first, and the household will naturally be harmonious.',overall:'The answer is not out there — it\'s within you. Let go of the attachment to searching outside and return to your original heart.'},dos:'Do: Meditate, read and reflect, simplify life, be grateful for what you have',donts:'Don\'t: Grasp outwardly, crave quantity over quality, believe in shortcuts, vacillate between gain and loss',luckyColor:'Lotus Purple',luckyNum:'7 / 12',luckyDir:'East'},
  {id:50,level:'Excellent',title:'Moon in Water, Flower in Mirror',poem:'Look in the mirror — the flower is false,\nScoop the moon from water — always in vain.\nIf you can recognize the true message,\nIt lies not in ordinary forms.',vernacular:'The flower in the mirror is an illusion. Scooping the moon from the water is always in vain. What you are desperately pursuing may not be what you truly need. The real answer and wisdom do not lie in surface appearances — let go of attachment and shift your perspective, and you will see things as they truly are.',interpretation:{career:'Don\'t be dazzled by high salary or prestige on the surface — see the company and role clearly before deciding.',love:'Don\'t be deceived by appearances or sweet words — see the other person\'s true heart. Let go of unsuitable relationships early.',wealth:'Beware of fake investment projects and get-rich-quick scams. Pragmatic financial management is the right way.',health:'Don\'t blindly trust folk remedies or supplements — return to basic routines and diet as the foundation.',study:'Don\'t chase superficial scores or certificates — real learning lies in understanding, not memorization.',family:'Don\'t pretend to be perfect in front of family. Face each other sincerely — only then can relationships truly grow closer.',overall:'Form is emptiness, emptiness is form. Let go of attachment to surface things, and you\'ll see a more real world.'},dos:'Do: See the essence, move forward pragmatically, separate truth from falsehood, return to basics',donts:'Don\'t: Be fooled by appearances, chase empty fame, trust shortcuts, deceive yourself',luckyColor:'Pure White',luckyNum:'4 / 8',luckyDir:'South'},
  {id:99,level:'Poor',title:'Handan Dream',poem:'The millet half-cooked, the dream already over —\nHalf a lifetime\'s glory, just paper soldiers.\nWhy not turn back, find the old path?\nDeep among the white clouds, someone still tills the soil.',vernacular:'Lu Sheng\'s yellow-millet dream ended before the millet finished cooking — half a lifetime of fame and achievement was nothing but paper soldiers. Rather than clinging to a path that isn\'t truly yours, look back and find your original direction. Deep among the white clouds, someone is quietly tilling the soil — that is where you truly belong.',interpretation:{career:'Your current direction may not suit you. Consider returning to the field you were originally good at or passionate about.',love:'Who you\'re chasing may not truly be right for you. Turn around — someone may be quietly waiting.',wealth:'Finances are flat — don\'t pursue high-risk, high-return ventures. Return to a steady course.',health:'Physical exhaustion comes from chasing the wrong goals. Slow down and give body and mind a chance to return.',study:'Don\'t study for purely utilitarian purposes. Look back at what truly interests you — learning will be more effective.',family:'Home is the final place of return. If you\'re tired out there, look back — your family has been waiting.',overall:'The moment the dream ends is the moment of return to self. This lot is not about giving up negatively — it\'s about returning you to the path that is truly yours.'},dos:'Do: Return to your roots, slow down, reunite with family, organize the past',donts:'Don\'t: Persist in mistaken directions, remain stubbornly unrepentant, refuse to turn back, vainly compare with others',luckyColor:'Lotus Root Pink',luckyNum:'3 / 7',luckyDir:'Southwest'},
];

function TEMPLE_SLIPS_GUANYIN() { return (window._lang && window._lang() === 'en') ? TEMPLE_SLIPS_GUANYIN_EN : TEMPLE_SLIPS_GUANYIN_ZH; }
function TEMPLE_SLIPS_GUANDI() { return (window._lang && window._lang() === 'en') ? TEMPLE_SLIPS_GUANDI_EN : TEMPLE_SLIPS_GUANDI_ZH; }
function TEMPLE_SLIPS_LVZU() { return (window._lang && window._lang() === 'en') ? TEMPLE_SLIPS_LVZU_EN : TEMPLE_SLIPS_LVZU_ZH; }

