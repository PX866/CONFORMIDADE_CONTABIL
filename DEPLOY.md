# Guia de Deploy - Painel de Conformidade Contábil

## 📋 Pré-requisitos

- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] Conta no GitHub
- [ ] Conta no Vercel
- [ ] Projeto Firebase configurado

## 🔧 Configuração do Firebase

### 1. Acesse o Firebase Console

Vá para [console.firebase.google.com](https://console.firebase.google.com) e selecione o projeto **conformidade-contabil**.

### 2. Configure Authentication

1. No menu lateral, clique em **Authentication**
2. Vá para a aba **Sign-in method**
3. Clique em **Email/Password**
4. Ative a opção **Enable**
5. Salve

### 3. Configure Realtime Database

1. No menu lateral, clique em **Realtime Database**
2. Se ainda não criou, clique em **Create Database**
3. Escolha a localização (ex: us-central1)
4. Inicie em **test mode** (vamos configurar as regras depois)
5. Após criar, vá para a aba **Rules**
6. Cole as seguintes regras:

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

7. Clique em **Publish**

### 4. ~~Configure Storage~~ (NÃO É MAIS NECESSÁRIO)

⚠️ **ATUALIZAÇÃO v2.0**: O sistema agora salva todos os dados diretamente no **Realtime Database**.
O **Firebase Storage não é mais necessário** e pode ser desabilitado.

## 📤 Deploy no GitHub

### 1. Inicialize o repositório Git

```bash
cd painel-conformidade
git init
git add .
git commit -m "Initial commit - Painel de Conformidade Contábil"
```

### 2. Crie um repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **New repository**
3. Nome: `painel-conformidade-contabil`
4. Deixe como **Private** (recomendado)
5. **NÃO** inicialize com README
6. Clique em **Create repository**

### 3. Conecte e faça push

```bash
git remote add origin https://github.com/SEU_USUARIO/painel-conformidade-contabil.git
git branch -M main
git push -u origin main
```

## 🚀 Deploy no Vercel

### Método 1: Via Interface Web (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta do GitHub
3. Clique em **Add New Project**
4. Selecione o repositório **painel-conformidade-contabil**
5. Configure o projeto:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (ou `pnpm build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (ou `pnpm install`)
6. Clique em **Deploy**
7. Aguarde o deploy finalizar (2-3 minutos)
8. Acesse a URL gerada (ex: `painel-conformidade-contabil.vercel.app`)

### Método 2: Via CLI

1. Instale a CLI do Vercel:
```bash
npm install -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Na pasta do projeto, execute:
```bash
vercel
```

4. Responda as perguntas:
   - Set up and deploy? **Y**
   - Which scope? (Selecione sua conta)
   - Link to existing project? **N**
   - What's your project's name? **painel-conformidade-contabil**
   - In which directory is your code located? **./
**
   - Want to override the settings? **N**

5. Para deploy em produção:
```bash
vercel --prod
```

## ✅ Verificação Pós-Deploy

### 1. Teste a Autenticação

1. Acesse a URL do Vercel
2. Clique em **Criar conta**
3. Cadastre um usuário de teste
4. Faça login

### 2. Teste o Upload de Balancete

1. Clique em **Novo Balancete**
2. Selecione mês e ano
3. Faça upload de um arquivo JSON de teste
4. Verifique se o upload foi bem-sucedido

### 3. Teste o Painel

1. Volte para **Consulta**
2. Clique no balancete registrado
3. Verifique se o painel carrega corretamente
4. Teste os filtros

## 🔐 Configurações de Segurança (Importante!)

### 1. Domínios Autorizados no Firebase

1. No Firebase Console, vá em **Authentication**
2. Clique na aba **Settings**
3. Role até **Authorized domains**
4. Adicione o domínio do Vercel:
   - `painel-conformidade-contabil.vercel.app`
   - ou seu domínio customizado

### 2. CORS no Storage

Se tiver problemas de CORS:

1. Instale o Google Cloud SDK
2. Execute:
```bash
gsutil cors set cors.json gs://conformidade-contabil.firebasestorage.app
```

Onde `cors.json` contém:
```json
[
  {
    "origin": ["https://painel-conformidade-contabil.vercel.app"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

## 🌐 Domínio Customizado (Opcional)

### No Vercel

1. No dashboard do projeto, vá em **Settings**
2. Clique em **Domains**
3. Adicione seu domínio customizado
4. Siga as instruções para configurar o DNS

### No Firebase

1. Adicione o domínio customizado em **Authorized domains**

## 📊 Monitoramento

### Vercel Analytics

1. No dashboard do projeto, vá em **Analytics**
2. Ative o **Vercel Analytics** (gratuito)

### Firebase Console

1. Monitore usuários em **Authentication**
2. Monitore uploads em **Storage**
3. Monitore dados em **Realtime Database**

## 🐛 Problemas Comuns

### Erro 404 ao recarregar página

**Solução**: O arquivo `vercel.json` já está configurado com rewrites.

### Erro de CORS no Firebase

**Solução**: Configure os domínios autorizados no Firebase.

### Build falha no Vercel

**Solução**: Verifique se todas as dependências estão no `package.json`.

### Página em branco após deploy

**Solução**: 
1. Abra o console do navegador (F12)
2. Verifique erros
3. Confirme que as configurações do Firebase estão corretas

## 🔄 Atualizações Futuras

Para fazer deploy de atualizações:

```bash
git add .
git commit -m "Descrição da atualização"
git push origin main
```

O Vercel fará o deploy automaticamente!

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no Vercel Dashboard
2. Verifique o console do navegador
3. Verifique os logs do Firebase Console
