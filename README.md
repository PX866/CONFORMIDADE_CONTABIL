# Painel de Conformidade Contábil

Sistema completo para gerenciamento de balancetes contábeis com autenticação, upload de arquivos JSON e visualização de conformidade.

## 🚀 Funcionalidades

- ✅ **Autenticação** - Login e cadastro com Firebase Authentication (Email/Senha)
- ✅ **Registro de Balancete** - Upload de arquivos JSON com seleção de mês/ano
- ✅ **Consulta de Balancetes** - Listagem de todos os balancetes registrados
- ✅ **Painel de Conformidade** - Visualização detalhada com filtros e estatísticas
- ✅ **Filtros por Coluna** - Filtros individuais em cada coluna
- ✅ **Dropdown de Responsáveis** - Atribuição de responsáveis (DANIEL, RIOS, JEFFERSON, HUGO, RAFAEL, RENATO)
- ✅ **Apenas Contas Analíticas** - Sistema filtra automaticamente
- ✅ **Otimizado para Desktop** - Layout amplo até 1920px

## 🛠️ Tecnologias

- **React 19** + **Vite**
- **Firebase** (Authentication + Realtime Database + Storage)
- **React Router DOM** - Navegação entre páginas
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Lucide Icons** - Ícones

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Firebase (já configurada)
- Git instalado

### Passos

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd painel-conformidade
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
# ou
yarn install
```

3. Execute o projeto localmente:
```bash
npm run dev
# ou
pnpm dev
# ou
yarn dev
```

4. Acesse no navegador:
```
http://localhost:5173
```

## 🔥 Configuração do Firebase

O projeto já está configurado com as credenciais do Firebase no arquivo `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBpZ_25f6JqjEvezD3urhEB_oy34whZSnE",
  authDomain: "conformidade-contabil.firebaseapp.com",
  databaseURL: "https://conformidade-contabil-default-rtdb.firebaseio.com",
  projectId: "conformidade-contabil",
  storageBucket: "conformidade-contabil.firebasestorage.app",
  messagingSenderId: "147005050821",
  appId: "1:147005050821:web:5d3a88d0e4273594af85ac"
};
```

### Configurações Necessárias no Firebase Console

1. **Authentication**
   - Ative o método **Email/Senha** em Authentication > Sign-in method

2. **Realtime Database**
   - Crie um banco de dados em modo de teste ou configure as regras:
   ```json
   {
     "rules": {
       "balancetes": {
         "$uid": {
           ".read": "$uid === auth.uid",
           ".write": "$uid === auth.uid"
         }
       }
     }
   }
   ```

3. **~~Storage~~** (NÃO É MAIS NECESSÁRIO)
   - ⚠️ **ATUALIZAÇÃO v2.0**: O sistema agora salva todos os dados diretamente no Realtime Database
   - O Firebase Storage não é mais utilizado e pode ser desabilitado

## 📤 Deploy no Vercel

### Via CLI

1. Instale a CLI do Vercel:
```bash
npm install -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Para produção:
```bash
vercel --prod
```

### Via Interface Web

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New Project**
3. Importe o repositório do GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` ou `pnpm build`
   - **Output Directory**: `dist`
5. Clique em **Deploy**

## 📁 Estrutura do Projeto

```
painel-conformidade/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui
│   │   └── PrivateRoute.jsx # Rota protegida
│   ├── contexts/
│   │   └── AuthContext.jsx  # Contexto de autenticação
│   ├── pages/
│   │   ├── Login.jsx        # Tela de login
│   │   ├── Signup.jsx       # Tela de cadastro
│   │   ├── ConsultaBalancete.jsx  # Lista de balancetes
│   │   ├── RegistroBalancete.jsx  # Upload de balancete
│   │   ├── Painel.jsx       # Carregador do painel
│   │   └── PainelConformidade.jsx # Painel principal
│   ├── firebase.js          # Configuração do Firebase
│   ├── App.jsx              # Rotas principais
│   ├── App.css              # Estilos globais
│   └── main.jsx             # Entry point
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 📋 Formato do Arquivo JSON

O arquivo JSON do balancete deve seguir este formato:

```json
[
  {
    "CONTA": "1.01.01.001",
    "DESCRICAO": "Caixa Geral",
    "SALDO ANTERIOR": 10000.00,
    "DEBITO": 5000.00,
    "CREDITO": 3000.00,
    "SALDO ATUAL": 12000.00,
    "CLASSE": "ANALITICA",
    "GRUPO": "ATIVO CIRCULANTE",
    "COMPARATIVO": "POSITIVO"
  }
]
```

**Campos obrigatórios:**
- `CONTA` - Código da conta
- `DESCRICAO` - Descrição da conta
- `SALDO ANTERIOR` - Saldo do período anterior
- `DEBITO` - Movimentação a débito
- `CREDITO` - Movimentação a crédito
- `SALDO ATUAL` - Saldo atual
- `CLASSE` - ANALITICA ou SINTETICA (apenas ANALITICA será exibida)
- `GRUPO` - Grupo contábil
- `COMPARATIVO` - POSITIVO, NEGATIVO ou NEUTRO

## 🔐 Primeiro Acesso

1. Acesse a aplicação
2. Clique em **Criar conta**
3. Cadastre-se com email e senha
4. Faça login
5. Clique em **Novo Balancete**
6. Selecione o mês e ano
7. Faça upload do arquivo JSON
8. Visualize o painel de conformidade

## 🎯 Uso do Sistema

### Registro de Balancete

1. Na tela de **Consulta**, clique em **Novo Balancete**
2. Selecione o **Mês** e **Ano**
3. Clique para selecionar o **arquivo JSON**
4. Clique em **Registrar Balancete**
5. Aguarde o upload e processamento

### Consulta de Balancetes

- A tela inicial mostra todos os balancetes registrados
- Cada card exibe:
  - Mês/Ano
  - Nome do arquivo
  - Total de contas
  - Contas analíticas
  - Data de registro
- Clique em um card para visualizar o painel

### Painel de Conformidade

- **Filtros**: Use os campos no topo de cada coluna
- **Responsáveis**: Selecione no dropdown de cada conta
- **Status**: Marque como Conciliado ou Pendente
- **Estatísticas**: Visualize os cards de resumo no topo
- **Navegação**: Use o botão "Voltar" para retornar à consulta

## 🐛 Troubleshooting

### Erro ao fazer login
- Verifique se o Authentication está ativado no Firebase
- Confirme que o método Email/Senha está habilitado

### Erro ao fazer upload
- Verifique as regras do Storage no Firebase
- Confirme que o arquivo é um JSON válido
- Verifique o tamanho do arquivo (máximo 10MB)

### Página em branco
- Abra o console do navegador (F12)
- Verifique erros de JavaScript
- Confirme que todas as dependências foram instaladas

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## 📄 Licença

Este projeto é privado e de uso interno.
