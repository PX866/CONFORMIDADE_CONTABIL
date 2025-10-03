# 🚀 Início Rápido - Painel de Conformidade Contábil

## ⚡ Executar na sua máquina (5 minutos)

### 1. Extrair o projeto
```bash
# Extraia o arquivo painel-conformidade-completo.zip
# Navegue até a pasta
cd painel-conformidade
```

### 2. Instalar dependências
```bash
npm install
# ou se preferir pnpm (mais rápido)
npm install -g pnpm
pnpm install
```

### 3. Executar localmente
```bash
npm run dev
# ou
pnpm dev
```

### 4. Acessar
Abra o navegador em: **http://localhost:5173**

---

## 🔥 Configurar Firebase (10 minutos)

### Passo 1: Ativar Authentication
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Selecione o projeto **conformidade-contabil**
3. Menu **Authentication** → **Sign-in method**
4. Ative **Email/Password**

### Passo 2: Configurar Realtime Database
1. Menu **Realtime Database** → **Create Database**
2. Escolha localização **us-central1**
3. Inicie em **test mode**
4. Vá em **Rules** e cole:
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
5. **Publish**

### ~~Passo 3: Configurar Storage~~ (NÃO NECESSÁRIO)

⚠️ **ATUALIZAÇÃO v2.0**: Storage não é mais usado! Tudo é salvo no Realtime Database.

✅ **Pronto! O Firebase está configurado!**

---

## 📤 Deploy no Vercel (5 minutos)

### Método Simples (Interface Web)

1. **Criar repositório no GitHub**
   ```bash
   cd painel-conformidade
   git init
   git add .
   git commit -m "Initial commit"
   ```
   
2. **No GitHub:**
   - Criar novo repositório (pode ser privado)
   - Copiar comandos de push e executar

3. **No Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Login com GitHub
   - **Add New Project**
   - Selecione o repositório
   - Framework: **Vite**
   - **Deploy**

4. **Aguarde 2-3 minutos**

5. **Adicionar domínio no Firebase:**
   - Firebase Console → Authentication → Settings
   - **Authorized domains** → Adicionar domínio do Vercel

✅ **Seu sistema está no ar!**

---

## 📝 Primeiro Uso

### 1. Criar Conta
- Acesse o sistema
- Clique em **Criar conta**
- Use um email válido e senha (mínimo 6 caracteres)

### 2. Registrar Balancete
- Clique em **Novo Balancete**
- Selecione **Mês** e **Ano**
- Faça upload do arquivo **JSON**
- Aguarde o processamento

### 3. Visualizar Painel
- Volte para **Consulta**
- Clique no card do balancete
- Use os filtros para analisar

---

## 📋 Formato do JSON

Seu arquivo JSON deve ter este formato:

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

**Importante:** Apenas contas com `"CLASSE": "ANALITICA"` serão exibidas.

---

## 🆘 Problemas?

### Erro ao criar conta
→ Verifique se ativou **Email/Password** no Firebase Authentication

### Erro ao fazer upload
→ Verifique se configurou as **Rules** do Storage

### Página em branco
→ Abra o console (F12) e verifique erros

### Build falha no Vercel
→ Verifique se fez `npm install` localmente primeiro

---

## 📚 Documentação Completa

- **README.md** - Documentação completa do projeto
- **DEPLOY.md** - Guia detalhado de deploy e configuração
- **Este arquivo** - Início rápido

---

## ✅ Checklist

- [ ] Extraí o projeto
- [ ] Instalei as dependências
- [ ] Executei localmente
- [ ] Configurei Firebase Authentication
- [ ] Configurei Firebase Realtime Database
- [ ] Configurei Firebase Storage
- [ ] Criei repositório no GitHub
- [ ] Fiz deploy no Vercel
- [ ] Adicionei domínio no Firebase
- [ ] Testei criar conta
- [ ] Testei upload de balancete
- [ ] Testei visualização do painel

---

**Tudo funcionando? Parabéns! 🎉**

Se tiver dúvidas, consulte o **DEPLOY.md** para mais detalhes.
