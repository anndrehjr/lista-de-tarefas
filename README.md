# Gerenciador de Tarefas

Um aplicativo de gerenciamento de tarefas completo construído com Next.js e React, com foco em uma experiência de usuário intuitiva e funcionalidades avançadas.

![Captura de tela do aplicativo](https://placeholder.svg?height=400&width=800)

## 🌟 Funcionalidades

- ✅ **Autenticação com Google** - Login simplificado usando sua conta Google
- 📋 **Gerenciamento de tarefas** - Adicione, edite, exclua e marque tarefas como concluídas
- 📊 **Estatísticas** - Visualize estatísticas sobre suas tarefas e progresso
- 🔄 **Drag and Drop** - Reorganize suas tarefas facilmente com arrastar e soltar
- 📱 **Design responsivo** - Funciona perfeitamente em dispositivos móveis e desktop
- 🌓 **Modo escuro** - Alterne entre temas claro e escuro
- 📅 **Datas de vencimento** - Defina prazos para suas tarefas
- 🔔 **Notificações** - Receba alertas sobre tarefas próximas do vencimento
- 📂 **Categorias** - Organize tarefas por categorias (trabalho, pessoal, estudo, etc.)
- 📝 **Subtarefas** - Divida tarefas complexas em subtarefas gerenciáveis
- 🔍 **Filtros** - Filtre tarefas por status e categoria

## 🚀 Tecnologias Utilizadas

- **Next.js** - Framework React para renderização do lado do servidor
- **React** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset JavaScript tipado
- **CSS Modules** - Estilização com escopo local
- **HTML5 Drag and Drop API** - Para funcionalidade de arrastar e soltar
- **LocalStorage** - Para persistência de dados no navegador

## 📋 Pré-requisitos

- Node.js 14.x ou superior
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
   \`\`\`bash
   git clone https://github.com/anndrehjr/lista-de-tarefass.git
   cd gerenciador-tarefas
   \`\`\`

2. Instale as dependências:
   \`\`\`bash
   npm install
   # ou
   yarn install
   \`\`\`

3. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   npm run dev
   # ou
   yarn dev
   \`\`\`

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔧 Configuração

### Autenticação com Google (Produção)

Para implementar a autenticação real com Google em produção:

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
2. Configure as credenciais OAuth 2.0
3. Instale o NextAuth.js:
   \`\`\`bash
   npm install next-auth
   # ou
   yarn add next-auth
   \`\`\`
4. Configure o NextAuth.js seguindo a [documentação oficial](https://next-auth.js.org/providers/google)

## 📱 Uso

1. Faça login com sua conta Google
2. Adicione tarefas usando o formulário na parte superior
3. Defina categorias e datas de vencimento conforme necessário
4. Organize suas tarefas arrastando e soltando
5. Adicione subtarefas para dividir tarefas complexas
6. Use os filtros para encontrar tarefas específicas
7. Visualize estatísticas para acompanhar seu progresso

## 🔄 Roadmap

Funcionalidades planejadas para futuras versões:

- [ ] Sincronização com banco de dados (Firebase/Supabase)
- [ ] Compartilhamento de tarefas com outros usuários
- [ ] Exportação de tarefas para CSV/PDF
- [ ] Lembretes por e-mail
- [ ] Etiquetas personalizadas
- [ ] Visualização em calendário
- [ ] Aplicativo móvel (React Native)
- [ ] Integração com serviços externos (Google Calendar, Trello, etc.)
- [ ] Modo offline com sincronização posterior

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato


Link do Projeto: [https://github.com/seu-usuario/gerenciador-tarefas](https://github.com/seu-usuario/gerenciador-tarefas)
\`\`\`

Agora, vamos implementar a integração real com o Google Auth (para produção):
