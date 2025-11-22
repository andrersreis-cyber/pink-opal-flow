1. Visão geral do produto

O Pink Opal Flow é uma aplicação web criada para centralizar, organizar e otimizar a rotina de atendimento em clínicas e salões de beleza. Ele substitui métodos manuais e improvisados como agendas em papel, planilhas dispersas e conversas desorganizadas em aplicativos de mensagem por um sistema único, visual, moderno e fácil de usar.

A plataforma reúne em um só ambiente a gestão de agenda, clientes, histórico de atendimentos e métricas de desempenho, permitindo que o negócio opere de forma mais profissional, previsível e escalável.

O foco principal é transformar processos confusos em um fluxo de trabalho organizado, visual e inteligente, reduzindo erros operacionais, melhorando a experiência do cliente e aumentando a produtividade da equipe.

2. Problema identificado

Clínicas e salões de beleza enfrentam diariamente uma série de desafios relacionados à organização e ao controle operacional. Entre os principais problemas estão:

Conflitos e sobreposição de horários, causados pela falta de um sistema centralizado de agendamento.
Registros feitos em papel, mensagens ou planilhas desconectadas, que se perdem facilmente.
Falta de controle do histórico de cada cliente, impossibilitando um atendimento personalizado e estratégico.
Ausência de métricas reais sobre desempenho, ocupação da agenda e faturamento.
Dificuldade em visualizar horários livres, horários ocupados e a taxa real de ocupação do dia ou da semana.
Perda de clientes por esquecimento de horários, má gestão ou falta de organização.
Desorganização que gera estresse, prejudica o atendimento e trava o crescimento do negócio.

O problema não é apenas a agenda em si, mas sim a falta de um ecossistema integrado que una clientes, serviços, horários, histórico e dados em um único ambiente de fácil gestão.

3. Solução proposta

O Pink Opal Flow foi desenvolvido exatamente para resolver esse conjunto de problemas. Ele funciona como uma plataforma central de gestão para clínicas e salões, permitindo total controle da rotina de atendimento por meio de uma interface simples, moderna e altamente visual.

A solução permite que o usuário gerencie sua agenda em diferentes visualizações (dia, semana e mês), cadastre e organize seus clientes, registre todo o histórico de atendimentos e acompanhe métricas importantes do negócio em tempo real.

A aplicação é construída sobre uma arquitetura moderna, utilizando Vite, React e TypeScript no frontend, Tailwind CSS e shadcn-ui para a interface visual, Supabase como backend e banco de dados, e Lovable para automação e deploy. Essa combinação garante velocidade, segurança, escalabilidade e baixo custo operacional.

Com isso, o Pink Opal Flow transforma uma rotina caótica em um fluxo organizado e eficiente, permitindo que o usuário foque no que realmente importa: o atendimento e o crescimento do seu negócio.

4. Proposta de valor

O Pink Opal Flow transforma desorganização em controle, tempo perdido em produtividade e atendimentos dispersos em uma gestão profissional, simples e inteligente.

Ele entrega:

Organização centralizada da agenda e dos clientes.
Redução de erros e conflitos de horário.
Aumento significativo de produtividade.
Melhoria da experiência do cliente.
Tomada de decisão baseada em dados reais.
Profissionalização da gestão sem exigir conhecimento técnico.

Tudo isso em uma plataforma visual, intuitiva, moderna e adaptada à realidade de clínicas e salões de beleza.

5. Público-alvo e personas

O produto é voltado principalmente para clínicas de estética, salões de beleza e estúdios de procedimentos.

A persona principal é a gestora do espaço, que normalmente é a própria dona do negócio. Ela é responsável por agenda, atendimento, organização da equipe e controle básico do faturamento, mas enfrenta dificuldade para manter tudo organizado com ferramentas manuais ou improvisadas. Ela precisa de um sistema simples, confiável e rápido que resolva a desorganização do dia a dia.

A persona secundária é a recepcionista ou assistente, responsável por marcar horários, atender clientes e organizar a agenda do dia. Ela precisa de uma ferramenta extremamente intuitiva, rápida e livre de erros.

Futuramente, a plataforma poderá atender também gestores que possuem mais de uma unidade, oferecendo uma visão unificada de várias agendas e métricas consolidadas.

6. Arquitetura técnica

O Pink Opal Flow possui uma arquitetura moderna e desacoplada, dividida em frontend, backend e camada de automação.

O frontend é construído em Vite + React + TypeScript, utilizando Tailwind CSS e shadcn-ui para a criação de uma interface limpa, responsiva e altamente componentizada. Toda a lógica de interface é organizada em componentes reutilizáveis e hooks customizados, garantindo manutenibilidade e escalabilidade.

O backend é sustentado pelo Supabase, que fornece banco de dados, autenticação, sincronização em tempo real e segurança por meio de políticas de RLS (Row Level Security). Isso garante que os dados sejam protegidos e acessados apenas por usuários autorizados.

O deploy, integrações e automações são orquestrados pelo Lovable, permitindo atualizações rápidas, controle visual do projeto e facilidade de replicação.

As principais entidades do sistema são clientes, agendamentos, histórico de atendimentos, usuários e serviços.

7. Funcionalidades principais

O Pink Opal Flow é composto por quatro grandes módulos principais.

O módulo de agenda permite visualizar os compromissos em três formatos: diário, semanal e mensal. Nele é possível criar, editar, excluir e visualizar detalhes de cada agendamento, associando um cliente e um serviço específico. O sistema valida conflitos de horário, evitando sobreposição de atendimentos, e mantém todos os dados sincronizados em tempo real com o banco.

O módulo de clientes permite cadastrar, editar e excluir clientes, organizar as informações de forma centralizada e acessar rapidamente o perfil de cada cliente. Cada cliente possui ligação direta com seus agendamentos e com seu histórico de atendimentos.

O módulo de histórico registra cada atendimento realizado, permitindo que o usuário acompanhe procedimentos feitos, observações importantes, datas, profissionais envolvidos e frequência de visitas. Isso favorece atendimentos mais personalizados e estratégicos.

O módulo de dashboard apresenta métricas fundamentais do negócio, como número de atendimentos, taxa de ocupação da agenda, clientes ativos, serviços mais realizados e uma estimativa de receita. Esses dados são exibidos de forma visual, por meio de cards e gráficos.

8. Requisitos funcionais

O sistema deve permitir o cadastro, edição e exclusão de clientes.
O sistema deve permitir visualizar a agenda em formato diário, semanal e mensal.
O sistema deve permitir criar, editar e excluir agendamentos.
O sistema deve permitir a associação de clientes e serviços a cada agendamento.
O sistema deve validar automaticamente conflitos de horário entre atendimentos.
O sistema deve registrar automaticamente o histórico após cada atendimento.
O sistema deve permitir a visualização do histórico por cliente.
O sistema deve exibir métricas de desempenho no dashboard.
O sistema deve funcionar em tempo real, sincronizando os dados entre usuários.

9. Requisitos não funcionais

A aplicação deve ser responsiva, funcionando em computador, tablet e celular.
O tempo médio de carregamento das telas deve ser inferior a dois segundos.
O sistema deve utilizar controle de acesso e segurança por meio de RLS no Supabase.
O código deve ser organizado, modular e tipado em TypeScript.
A interface deve ser simples, intuitiva e de fácil aprendizado.
O custo de manutenção deve ser baixo.

10. Fluxo de uso do produto

O usuário acessa o sistema através de login seguro.
Em seguida, é direcionado para o dashboard principal, onde visualiza métricas do negócio.
A partir dali, pode acessar a agenda e verificar horários disponíveis ou ocupados.
Após localizar um horário, é possível criar um novo agendamento, vinculando um cliente e um serviço.
O atendimento é realizado e automaticamente registrado no histórico.
O usuário acompanha novamente os dados no dashboard.

11. KPIs do produto

Taxa de ocupação da agenda
Quantidade de atendimentos por dia e por semana
Número de clientes ativos
Estimativa de receita mensal
Taxa de retorno de clientes

12. Fora de escopo para o MVP

Integração com pagamentos online.
Aplicativo mobile nativo.
Integração direta com WhatsApp.
Programa de fidelidade.
Sistema multi-unidade.

Essas funcionalidades ficam previstas para versões futuras.

13. Roadmap evolutivo

Na primeira versão (MVP) o foco é entregar a agenda, gestão de clientes, histórico e um dashboard básico totalmente funcional.

Na segunda versão serão adicionadas integrações com WhatsApp, controle financeiro mais detalhado, relatórios avançados e suporte para múltiplos profissionais.

Na terceira versão será implementado suporte para múltiplas unidades, inteligência artificial para previsão de horários ideais, campanhas automatizadas e um CRM completo.

14. Riscos e mitigação

O crescimento descontrolado de dados pode impactar a performance, o que será mitigado por otimização de consultas e boas práticas de banco.

A dependência do Supabase será reduzida por meio de backups periódicos.

A ausência de automações mais complexas será resolvida futuramente com integrações via n8n.

15. Critérios de aceite

O sistema deve permitir criar e gerenciar agendamentos sem erros.
O cadastro e a consulta de clientes devem funcionar perfeitamente.
O dashboard deve exibir métricas claras e funcionais.
A navegação entre telas deve ser simples e intuitiva.
O sistema deve eliminar conflitos de horário.

Somente após atender esses critérios o produto será considerado pronto para uso real.

16. Resumo executivo

O Pink Opal Flow é uma solução moderna, organizada e eficiente para clínicas e salões de beleza que desejam profissionalizar sua gestão, aumentar produtividade e melhorar a experiência do cliente.

Ele entrega controle, organização e clareza, permitindo que o operador do negócio foque no crescimento, enquanto a plataforma cuida da organização.

É uma base sólida para evolução futura, com alto potencial de escala e expansão para novos mercados.